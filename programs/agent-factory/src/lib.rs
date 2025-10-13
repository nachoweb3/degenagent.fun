use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Factory11111111111111111111111111111111111");

#[program]
pub mod agent_factory {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, creation_fee: u64) -> Result<()> {
        let factory_state = &mut ctx.accounts.factory_state;
        factory_state.authority = ctx.accounts.authority.key();
        factory_state.treasury = ctx.accounts.treasury.key();
        factory_state.creation_fee = creation_fee;
        factory_state.total_agents_created = 0;
        factory_state.bump = ctx.bumps.factory_state;

        msg!("Factory initialized with fee: {} lamports", creation_fee);
        Ok(())
    }

    pub fn create_agent(
        ctx: Context<CreateAgent>,
        name: String,
        symbol: String,
        purpose: String,
        agent_wallet: Pubkey,
    ) -> Result<()> {
        require!(name.len() > 0 && name.len() <= 32, ErrorCode::InvalidName);
        require!(symbol.len() > 0 && symbol.len() <= 10, ErrorCode::InvalidSymbol);
        require!(purpose.len() > 0 && purpose.len() <= 200, ErrorCode::InvalidPurpose);
        require!(agent_wallet != Pubkey::default(), ErrorCode::InvalidAgentWallet);

        let factory_state = &mut ctx.accounts.factory_state;

        // Transfer creation fee to treasury
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.creator.key(),
            &factory_state.treasury,
            factory_state.creation_fee,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.treasury_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Mint initial supply to creator (1,000,000 tokens with 6 decimals)
        let initial_supply = 1_000_000_000_000u64;

        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.token_mint.to_account_info(),
                },
            ),
            initial_supply,
        )?;

        // Increment counter
        factory_state.total_agents_created += 1;

        // Emit event
        emit!(AgentCreatedEvent {
            agent_pubkey: ctx.accounts.agent_state.key(),
            creator: ctx.accounts.creator.key(),
            token_mint: ctx.accounts.token_mint.key(),
            agent_wallet,
            name: name.clone(),
            symbol: symbol.clone(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Agent created: {} ({})", name, symbol);
        msg!("Agent pubkey: {}", ctx.accounts.agent_state.key());
        msg!("Token mint: {}", ctx.accounts.token_mint.key());

        Ok(())
    }

    pub fn update_creation_fee(ctx: Context<UpdateCreationFee>, new_fee: u64) -> Result<()> {
        let factory_state = &mut ctx.accounts.factory_state;
        factory_state.creation_fee = new_fee;

        msg!("Creation fee updated to: {} lamports", new_fee);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + FactoryState::INIT_SPACE,
        seeds = [b"factory"],
        bump
    )]
    pub factory_state: Account<'info, FactoryState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Treasury account to receive fees
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, symbol: String, purpose: String, agent_wallet: Pubkey)]
pub struct CreateAgent<'info> {
    #[account(
        mut,
        seeds = [b"factory"],
        bump = factory_state.bump
    )]
    pub factory_state: Account<'info, FactoryState>,

    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: Treasury account from factory state
    #[account(mut)]
    pub treasury_account: UncheckedAccount<'info>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = token_mint,
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = token_mint,
        associated_token::authority = creator,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    /// CHECK: Agent state account initialized via CPI
    #[account(mut)]
    pub agent_state: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateCreationFee<'info> {
    #[account(
        mut,
        seeds = [b"factory"],
        bump = factory_state.bump,
        has_one = authority
    )]
    pub factory_state: Account<'info, FactoryState>,

    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct FactoryState {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub creation_fee: u64,
    pub total_agents_created: u64,
    pub bump: u8,
}

#[event]
pub struct AgentCreatedEvent {
    pub agent_pubkey: Pubkey,
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub agent_wallet: Pubkey,
    #[index]
    pub name: String,
    pub symbol: String,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name must be between 1 and 32 characters")]
    InvalidName,
    #[msg("Symbol must be between 1 and 10 characters")]
    InvalidSymbol,
    #[msg("Purpose must be between 1 and 200 characters")]
    InvalidPurpose,
    #[msg("Agent wallet cannot be default pubkey")]
    InvalidAgentWallet,
}
