use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::pubkey::Pubkey;

use crate::generated::state::{Account, AccountPDA, CertificateMetadata};

/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] Auto-generated, default fee payer
/// 1. `[writable, signer]` mint: [Mint]
/// 2. `[writable]` certificate: [CertificateMetadata]
/// 3. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
/// 4. `[writable, signer]` funding: [AccountInfo] Funding account (must be a system account)
/// 5. `[writable]` assoc_token_account: [AccountInfo] Associated token account address to be created
/// 6. `[]` wallet: [AccountInfo] Wallet address for the new associated token account
/// 7. `[]` token_program: [AccountInfo] SPL Token program
/// 8. `[signer]` owner: [AccountInfo] The mint's minting authority.
/// 9. `[]` csl_spl_token_v_0_0_0: [AccountInfo] Auto-generated, CslSplTokenProgram v0.0.0
/// 10. `[]` csl_spl_assoc_token_v_0_0_0: [AccountInfo] Auto-generated, CslSplAssocTokenProgram v0.0.0
///
/// Data:
/// - course_name: [String]
/// - student_name: [String]
/// - certificate_image_url: [String]
/// - course_description: [String]
pub fn issue_certificate(
    program_id: &Pubkey,
    for_initialize_mint_2: &[&AccountInfo],
    for_create: &[&AccountInfo],
    for_mint_to: &[&AccountInfo],
    for_set_authority: &[&AccountInfo],
    mint: &Account<spl_token::state::Mint>,
    certificate: &mut AccountPDA<CertificateMetadata>,
    funding: &AccountInfo,
    assoc_token_account: &AccountInfo,
    wallet: &AccountInfo,
    owner: &AccountInfo,
    course_name: String,
    student_name: String,
    certificate_image_url: String,
    course_description: String,
) -> ProgramResult {
    certificate.data.course_name = course_name;
    certificate.data.student_name = student_name;
    certificate.data.course_description = course_description;
    certificate.data.certificate_image_url = Some(certificate_image_url);
    certificate.data.mint = *mint.info.key;
    certificate.data.assoc_account = Some(*assoc_token_account.key);

    // Initialize the certificate mint
    csl_spl_token::src::cpi::initialize_mint_2(for_initialize_mint_2, 0, *wallet.key, None)?;

    // Create the associated token account
    csl_spl_assoc_token::src::cpi::create(for_create)?;

    // Mint the NFT
    csl_spl_token::src::cpi::mint_to(for_mint_to, 1)?;

    // Set the authority
    csl_spl_token::src::cpi::set_authority(for_set_authority, 0, Some(*owner.key))?;
    Ok(())
}
