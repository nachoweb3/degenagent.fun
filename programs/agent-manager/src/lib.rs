use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod agent_manager {
    use super::*;

    pub fn initialize_agent(
        ctx: Context<InitializeAgent>,
        name: String,
        purpose: String,
        agent_wallet: Pubkey,
        token_mint: Pubkey,
    ) -> Result<()> {
        let agent_state = &mut ctx.accounts.agent_state;

        agent_state.authority = ctx.accounts.authority.key();
        agent_state.agent_wallet = agent_wallet;
        agent_state.token_mint = token_mint;
        agent_state.vault = ctx.accounts.vault.key();
        agent_state.name = name;
        agent_state.purpose = purpose;
        agent_state.state = AgentStatus::Active;
        agent_state.total_trades = 0;
        agent_state.total_volume = 0;
        agent_state.revenue_pool = 0;
        agent_state.bump = ctx.bumps.agent_state;
        agent_state.vault_bump = ctx.bumps.vault;

        msg!("Agent initialized successfully");
        Ok(())
    }

    pub fn deposit_funds(ctx: Context<DepositFunds>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Transfer SOL from user to vault
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.depositor.key(),
            &ctx.accounts.vault.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.depositor.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        emit!(FundsDepositedEvent {
            agent: ctx.accounts.agent_state.key(),
            depositor: ctx.accounts.depositor.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Deposited {} lamports to agent vault", amount);
        Ok(())
    }

    pub fn execute_trade(
        ctx: Context<ExecuteTrade>,
        from_mint: Pubkey,
        to_mint: Pubkey,
        amount: u64,
        _min_output: u64,
        actual_output: u64,
    ) -> Result<()> {
        let agent_state = &mut ctx.accounts.agent_state;

        // Only agent wallet can execute trades
        require!(
            ctx.accounts.signer.key() == agent_state.agent_wallet,
            ErrorCode::UnauthorizedAgent
        );

        // Agent must be active
        require!(
            agent_state.state == AgentStatus::Active,
            ErrorCode::AgentNotActive
        );

        require!(amount > 0, ErrorCode::InvalidAmount);

        // Check vault has sufficient funds
        let vault_balance = ctx.accounts.vault.lamports();
        require!(vault_balance >= amount, ErrorCode::InsufficientFunds);

        // Note: In production, this would execute actual swap via Jupiter CPI
        // For MVP, we track the trade and calculate revenue share

        // Calculate profit (if any)
        if actual_output > amount {
            let profit = actual_output.checked_sub(amount).unwrap();

            // 1% platform fee from profit
            let platform_fee = profit.checked_div(100).unwrap_or(0);

            // Remaining 99% goes to revenue pool for token holders
            let revenue_for_holders = profit.checked_sub(platform_fee).unwrap();

            // Transfer platform fee to treasury
            if platform_fee > 0 {
                let agent_key = agent_state.key();
                let seeds = &[
                    b"vault",
                    agent_key.as_ref(),
                    &[agent_state.vault_bump],
                ];
                let signer = &[&seeds[..]];

                let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
                    &ctx.accounts.vault.key(),
                    &ctx.accounts.treasury.key(),
                    platform_fee,
                );

                anchor_lang::solana_program::program::invoke_signed(
                    &transfer_ix,
                    &[
                        ctx.accounts.vault.to_account_info(),
                        ctx.accounts.treasury.to_account_info(),
                        ctx.accounts.system_program.to_account_info(),
                    ],
                    signer,
                )?;

                msg!("Platform fee collected: {} lamports", platform_fee);
            }

            // Add revenue to pool for token holders
            agent_state.revenue_pool = agent_state.revenue_pool.checked_add(revenue_for_holders).unwrap();

            msg!("Revenue added to pool: {} lamports", revenue_for_holders);
        }

        agent_state.total_trades += 1;
        agent_state.total_volume = agent_state.total_volume.checked_add(amount).unwrap();

        emit!(TradeExecutedEvent {
            agent: ctx.accounts.agent_state.key(),
            from_mint,
            to_mint,
            amount_in: amount,
            amount_out: actual_output,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Trade executed: {} -> {}", from_mint, to_mint);
        msg!("Amount: {}, Output: {}", amount, actual_output);
        Ok(())
    }

    pub fn claim_revenue_share(ctx: Context<ClaimRevenue>) -> Result<()> {
        let agent_state = &mut ctx.accounts.agent_state;

        require!(agent_state.revenue_pool > 0, ErrorCode::NoRevenueAvailable);

        // Calculate user share based on token holdings
        let user_tokens = ctx.accounts.user_token_account.amount;
        let total_supply = ctx.accounts.token_mint.supply;

        require!(user_tokens > 0, ErrorCode::NoTokensHeld);

        let user_share = (agent_state.revenue_pool as u128)
            .checked_mul(user_tokens as u128)
            .unwrap()
            .checked_div(total_supply as u128)
            .unwrap() as u64;

        require!(user_share > 0, ErrorCode::ShareTooSmall);

        // Transfer share from vault to user
        let agent_key = agent_state.key();
        let seeds = &[
            b"vault",
            agent_key.as_ref(),
            &[agent_state.vault_bump],
        ];
        let signer = &[&seeds[..]];

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(),
            &ctx.accounts.user.key(),
            user_share,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer,
        )?;

        agent_state.revenue_pool = agent_state.revenue_pool.checked_sub(user_share).unwrap();

        emit!(RevenueClaimedEvent {
            agent: ctx.accounts.agent_state.key(),
            user: ctx.accounts.user.key(),
            amount: user_share,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Revenue claimed: {} lamports", user_share);
        Ok(())
    }

    pub fn update_purpose(ctx: Context<UpdatePurpose>, new_purpose: String) -> Result<()> {
        require!(new_purpose.len() > 0 && new_purpose.len() <= 200, ErrorCode::InvalidPurpose);

        let agent_state = &mut ctx.accounts.agent_state;
        let old_purpose = agent_state.purpose.clone();
        agent_state.purpose = new_purpose.clone();

        emit!(PurposeUpdatedEvent {
            agent: ctx.accounts.agent_state.key(),
            old_purpose,
            new_purpose,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Agent purpose updated");
        Ok(())
    }

    pub fn pause_agent(ctx: Context<PauseAgent>) -> Result<()> {
        let agent_state = &mut ctx.accounts.agent_state;

        require!(
            agent_state.state == AgentStatus::Active,
            ErrorCode::AgentAlreadyPaused
        );

        agent_state.state = AgentStatus::Paused;

        emit!(AgentStatusChangedEvent {
            agent: ctx.accounts.agent_state.key(),
            new_status: AgentStatus::Paused,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Agent paused");
        Ok(())
    }

    pub fn resume_agent(ctx: Context<ResumeAgent>) -> Result<()> {
        let agent_state = &mut ctx.accounts.agent_state;

        require!(
            agent_state.state == AgentStatus::Paused,
            ErrorCode::AgentAlreadyActive
        );

        agent_state.state = AgentStatus::Active;

        emit!(AgentStatusChangedEvent {
            agent: ctx.accounts.agent_state.key(),
            new_status: AgentStatus::Active,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Agent resumed");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, purpose: String)]
pub struct InitializeAgent<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + AgentState::INIT_SPACE,
        seeds = [b"agent", authority.key().as_ref()],
        bump
    )]
    pub agent_state: Account<'info, AgentState>,

    #[account(
        seeds = [b"vault", agent_state.key().as_ref()],
        bump
    )]
    /// CHECK: PDA vault for agent funds
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(
        seeds = [b"agent", agent_state.authority.as_ref()],
        bump = agent_state.bump
    )]
    pub agent_state: Account<'info, AgentState>,

    #[account(
        mut,
        seeds = [b"vault", agent_state.key().as_ref()],
        bump = agent_state.vault_bump
    )]
    /// CHECK: PDA vault
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteTrade<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent_state.authority.as_ref()],
        bump = agent_state.bump
    )]
    pub agent_state: Account<'info, AgentState>,

    #[account(
        mut,
        seeds = [b"vault", agent_state.key().as_ref()],
        bump = agent_state.vault_bump
    )]
    /// CHECK: PDA vault
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: AGENT.FUN treasury wallet - validated in backend
    pub treasury: UncheckedAccount<'info>,

    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRevenue<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent_state.authority.as_ref()],
        bump = agent_state.bump
    )]
    pub agent_state: Account<'info, AgentState>,

    #[account(
        mut,
        seeds = [b"vault", agent_state.key().as_ref()],
        bump = agent_state.vault_bump
    )]
    /// CHECK: PDA vault
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        associated_token::mint = token_mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(address = agent_state.token_mint)]
    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePurpose<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent_state.authority.as_ref()],
        bump = agent_state.bump,
        has_one = authority
    )]
    pub agent_state: Account<'info, AgentState>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct PauseAgent<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent_state.authority.as_ref()],
        bump = agent_state.bump,
        has_one = authority
    )]
    pub agent_state: Account<'info, AgentState>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResumeAgent<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent_state.authority.as_ref()],
        bump = agent_state.bump,
        has_one = authority
    )]
    pub agent_state: Account<'info, AgentState>,

    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct AgentState {
    pub authority: Pubkey,
    pub agent_wallet: Pubkey,
    pub token_mint: Pubkey,
    pub vault: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(200)]
    pub purpose: String,
    pub state: AgentStatus,
    pub total_trades: u64,
    pub total_volume: u64,
    pub revenue_pool: u64,
    pub bump: u8,
    pub vault_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum AgentStatus {
    Active,
    Paused,
}

#[event]
pub struct FundsDepositedEvent {
    pub agent: Pubkey,
    pub depositor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TradeExecutedEvent {
    pub agent: Pubkey,
    pub from_mint: Pubkey,
    pub to_mint: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub timestamp: i64,
}

#[event]
pub struct RevenueClaimedEvent {
    pub agent: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PurposeUpdatedEvent {
    pub agent: Pubkey,
    pub old_purpose: String,
    pub new_purpose: String,
    pub timestamp: i64,
}

#[event]
pub struct AgentStatusChangedEvent {
    pub agent: Pubkey,
    pub new_status: AgentStatus,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount specified")]
    InvalidAmount,
    #[msg("Only the agent wallet can execute trades")]
    UnauthorizedAgent,
    #[msg("Agent is not active")]
    AgentNotActive,
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
    #[msg("No revenue available to claim")]
    NoRevenueAvailable,
    #[msg("User holds no tokens")]
    NoTokensHeld,
    #[msg("Share too small to claim")]
    ShareTooSmall,
    #[msg("Purpose must be between 1 and 200 characters")]
    InvalidPurpose,
    #[msg("Agent is already paused")]
    AgentAlreadyPaused,
    #[msg("Agent is already active")]
    AgentAlreadyActive,
}
