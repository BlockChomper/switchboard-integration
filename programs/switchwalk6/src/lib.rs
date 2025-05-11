use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;

declare_id!("GaGzYqevtXiWfSqUZe6hENGXsNxGpSWEDyBn4bHRKZhF");

#[program]
pub mod sb_on_demand_solana {
    use super::*;

    pub fn pricefeedtest<'a>(ctx: Context<PriceFeedTest>) -> Result<()> {
        let feed_account = ctx.accounts.feed.data.borrow();
        // Docs at: https://switchboard-on-demand-rust-docs.web.app/on_demand/accounts/pull_feed/struct.PullFeedAccountData.html
        let feed = PullFeedAccountData::parse(feed_account).unwrap();
        msg!("price: {:?}", feed.value());
        Ok(())
    }

    pub fn quote_sol_for_usd<'a>(ctx: Context<SolUsdSwap>, usd_amount: u64) -> Result<()> {
        let feed_account = ctx.accounts.feed.data.borrow();
        let feed = PullFeedAccountData::parse(feed_account)
            .map_err(|_| error!(ErrorCode::InvalidFeedData))?;
        
        let sol_price_opt = feed.value();
        
        let sol_price = sol_price_opt.ok_or_else(|| error!(ErrorCode::InvalidPrice))?;
        
        let price_scale = 10u128.pow(sol_price.scale() as u32);
        let sol_price_scaled = sol_price.mantissa() as u128;
        
        require!(sol_price_scaled > 0, ErrorCode::InvalidPrice);
        
        let sol_lamports = (usd_amount as u128 * LAMPORTS_PER_SOL as u128 * price_scale) / 
                           (sol_price_scaled * 100);
        
        require!(sol_lamports > 0, ErrorCode::InvalidCalculation);
        require!(sol_lamports <= u64::MAX as u128, ErrorCode::AmountTooLarge);
        
        msg!("For {} USD cents, you would receive {} SOL lamports (approx. {} SOL)",
             usd_amount, sol_lamports, sol_lamports as f64 / LAMPORTS_PER_SOL as f64);
        
        Ok(())
    }

    
#[derive(Accounts)]
pub struct PriceFeedTest<'info> {
    /// CHECK: via switchboard sdk
    pub feed: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SolUsdSwap<'info> {
    /// CHECK: via switchboard sdk - SOL/USD price feed
    pub feed: AccountInfo<'info>,
    
    /// The account calling this instruction
    pub user: Signer<'info>,
    
    /// CHECK: System program for transfers
    pub system_program: AccountInfo<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid feed data or unable to parse feed")]
    InvalidFeedData,
    
    #[msg("Invalid price received from feed")]
    InvalidPrice,
    
    #[msg("Invalid calculation result")]
    InvalidCalculation,
    
    #[msg("Amount too large for representation")]
    AmountTooLarge,
}
}