use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("AgentReg1stry1111111111111111111111111111111");

#[program]
pub mod agent_registry {
    use super::*;

    /// Register a new AI agent (only ownership and ID on-chain)
    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        agent_id: String,
        name: String,
    ) -> Result<()> {
        require!(agent_id.len() <= 32, ErrorCode::AgentIdTooLong);
        require!(name.len() <= 64, ErrorCode::NameTooLong);

        let registry = &mut ctx.accounts.registry;
        registry.agent_id = agent_id;
        registry.name = name;
        registry.owner = ctx.accounts.owner.key();
        registry.created_at = Clock::get()?.unix_timestamp;
        registry.total_revenue = 0;
        registry.claimed_revenue = 0;
        registry.bump = ctx.bumps.registry;

        Ok(())
    }

    /// Claim accumulated revenue (platform deposits revenue here)
    pub fn claim_revenue(ctx: Context<ClaimRevenue>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;

        // Calculate claimable amount (total - already claimed)
        let claimable = registry
            .total_revenue
            .checked_sub(registry.claimed_revenue)
            .ok_or(ErrorCode::InsufficientRevenue)?;

        require!(claimable > 0, ErrorCode::NoRevenueToClaim);

        // Transfer SOL from registry PDA to owner
        let registry_lamports = ctx.accounts.registry.to_account_info().lamports();
        require!(registry_lamports >= claimable, ErrorCode::InsufficientBalance);

        **ctx.accounts.registry.to_account_info().try_borrow_mut_lamports()? -= claimable;
        **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += claimable;

        // Update claimed amount
        registry.claimed_revenue = registry.total_revenue;

        Ok(())
    }

    /// Transfer agent ownership
    pub fn transfer_ownership(
        ctx: Context<TransferOwnership>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.owner = new_owner;
        Ok(())
    }

    /// Deposit revenue (platform backend calls this after trades)
    pub fn deposit_revenue(
        ctx: Context<DepositRevenue>,
        amount: u64,
    ) -> Result<()> {
        // Transfer SOL from platform to registry PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.platform.to_account_info(),
                    to: ctx.accounts.registry.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update total revenue
        let registry = &mut ctx.accounts.registry;
        registry.total_revenue = registry
            .total_revenue
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(agent_id: String)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AgentRegistry::INIT_SPACE,
        seeds = [b"agent", agent_id.as_bytes()],
        bump
    )]
    pub registry: Account<'info, AgentRegistry>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRevenue<'info> {
    #[account(
        mut,
        seeds = [b"agent", registry.agent_id.as_bytes()],
        bump = registry.bump,
        has_one = owner
    )]
    pub registry: Account<'info, AgentRegistry>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(
        mut,
        seeds = [b"agent", registry.agent_id.as_bytes()],
        bump = registry.bump,
        has_one = owner
    )]
    pub registry: Account<'info, AgentRegistry>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositRevenue<'info> {
    #[account(
        mut,
        seeds = [b"agent", registry.agent_id.as_bytes()],
        bump = registry.bump
    )]
    pub registry: Account<'info, AgentRegistry>,

    #[account(mut)]
    pub platform: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct AgentRegistry {
    #[max_len(32)]
    pub agent_id: String,
    #[max_len(64)]
    pub name: String,
    pub owner: Pubkey,
    pub created_at: i64,
    pub total_revenue: u64,
    pub claimed_revenue: u64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Agent ID cannot be longer than 32 characters")]
    AgentIdTooLong,
    #[msg("Name cannot be longer than 64 characters")]
    NameTooLong,
    #[msg("Insufficient revenue to claim")]
    InsufficientRevenue,
    #[msg("No revenue available to claim")]
    NoRevenueToClaim,
    #[msg("Insufficient balance in registry")]
    InsufficientBalance,
    #[msg("Arithmetic overflow")]
    Overflow,
}
