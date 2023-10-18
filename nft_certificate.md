## NFT Certificate Solana Smart Contract

**This is a smart contract for creating and managing Non-Fungible Token (NFT) certificates on the Solana blockchain. NFT certificates are unique digital assets that represent certificates of achievement, reputation certificates, degree certificates, Event Ticket Badges, Reward Badges, Income certificates.**

# Purpose and Functionality

The NFT Certificate Smart Contract is designed to provide the following functionalities:

**Issue NFT Certificates:** You can use this contract to issue NFT certificates to individuals. Each certificate is represented as an NFT and contains metadata such as the course name, student name, and a link to the certificate image.

**Claim NFT Certificates:** Individuals can claim their NFT certificates once they are issued. This involves transferring the certificate NFT to their associated token account (ATA).

**Transfer NFT Certificates:** NFT certificate holders can transfer their certificates to other Solana wallet addresses.

**Burn NFT Certificates:** NFT certificates can be burned (destroyed) to remove them from circulation.

# Deployment of Solana Program 

```yaml
cidl: "0.8"
info:
  name: nft_certificate
  title: Solana NFT Certificate
  version: 0.0.1
  license:
    name: Unlicense
    identifier: Unlicense
types:
  CertificateMetadata:
    summary: A Solana NFT Certificate program for issuing, transferring, and burning NFT certificates.
    solana:
      seeds:
        - name: "certificate"
        - name: mint
          type: sol:pubkey
    fields:
      - name: course_name
        type: string
        solana:
          attributes: [ cap:16]
      - name: student_name
        type: string
        solana:
          attributes: [cap:16]
      - name: course_description
        type: string
        solana:
          attributes: [cap:255]
      - name: certificate_image_url
        type: rs:option<string>
        solana:
          attributes: [ cap:96 ]
      - name: mint
        type: sol:pubkey
      - name: assoc_account
        type: rs:option<sol:pubkey>
methods:
  - name: issue_certificate
    uses:
      - csl_spl_token.initialize_mint2
      - csl_spl_assoc_token.create
      - csl_spl_token.mint_to
      - csl_spl_token.set_authority
    inputs:
      - name: mint
        type: csl_spl_token.Mint
        solana:
          attributes: [ init ]
      - name: certificate
        type: CertificateMetadata
        solana:
          attributes: [ init ]
          seeds:
            mint: mint
      - name: course_name
        type: string
      - name: student_name
        type: string
      - name: certificate_image_url
        type: string
      - name: course_description
        type: string 
  - name: claim_certificate
    uses:
      - csl_spl_assoc_token.create
      - csl_spl_token.transfer_checked
    inputs:
      - name: claim
        type: csl_spl_token.Mint
      - name: certificate
        type: CertificateMetadata
        solana:
          attributes: [mut]
          seeds:
            mint: claim 
  - name: transfer_certificate
    uses:
      - csl_spl_assoc_token.create
      - csl_spl_token.transfer_checked
    inputs:
      - name: mint
        type: csl_spl_token.Mint
      - name: certificate
        type: CertificateMetadata
        solana:
          attributes: [ mut ]
          seeds:
            mint: mint
  - name: burn_certificate
    uses:
      - csl_spl_token.burn
    inputs:
      - name: mint
        type: csl_spl_token.Mint
      - name: certificate
        type: CertificateMetadata
        solana:
          attributes: [ mut ]
          seeds:
            mint: mint

```

# To generate code using this command

```javascript
    codigo solana generate nft_certificate.yaml
```

# Step 1: Issue certificate Function

```javascript

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

```

# Step 2: Implement Claim certificate 

```javascript

    pub fn claim_certificate(
    program_id: &Pubkey,
    for_create: &[&AccountInfo],
    for_transfer_checked: &[&AccountInfo],
    claim: &Account<spl_token::state::Mint>,
    certificate: &mut AccountPDA<CertificateMetadata>,
    funding: &AccountInfo,
    assoc_token_account: &AccountInfo,
    wallet: &AccountInfo,
    mint: &Account<spl_token::state::Mint>,
    source: &AccountInfo,
    destination: &AccountInfo,
    authority: &AccountInfo,
) -> ProgramResult {
    certificate.data.assoc_account = Some(*destination.key);

    if assoc_token_account.lamports() == 0 {
        csl_spl_assoc_token::src::cpi::create(for_create)?;
    }

    csl_spl_token::src::cpi::transfer_checked(for_transfer_checked, 1, 0)?;

    Ok(())
}

```

# Step 3: Implement Burn certificate

```javascript
      pub fn burn_certificate(
    program_id: &Pubkey,
    for_burn: &[&AccountInfo],
    mint: &Account<spl_token::state::Mint>,
    certificate: &mut AccountPDA<CertificateMetadata>,
    account: &AccountPDA<spl_token::state::Account>,
    owner: &AccountInfo,
    wallet: &AccountInfo,
) -> ProgramResult {
    certificate.data.assoc_account = None;
    csl_spl_token::src::cpi::burn(for_burn, 1)?;
    Ok(())
}
```

# After this build Solana program using command

```javascript
   cd program // go to program directory
   cargo build-sbf // build solana program

```

# Setup the Solana devne config file 

```javascript
solana config set --url devnet
solana airdrop 1 // to fund solana token
```

# Then deploy the program  
```javascript
solana program deploy target/deploy/nft_certificate.so 

```

**After deploy solana program you will get program ID**
```javascript
Program ID:7QR25bVbaNHHd8xHexdy555SEYh45jm5cV1mwNBHHghg
```

# install require dependency
```javascript
//go to program_client directory
 yarn add @solana/spl-token ts-node
```

# Here is the app.ts file for Test functionality with frontend

```javascript

import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, } from "@solana/web3.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import {
    burnCertificateSendAndConfirm,
    CslSplTokenPDAs,
    deriveCertificateMetadataPDA,
    getCertificateMetadata,
    initializeClient,
    issueCertificateSendAndConfirm,
    claimCertificateSendAndConfirm,
    transferCertificateSendAndConfirm
} from "./index";
import { getMinimumBalanceForRentExemptAccount, getMint, TOKEN_PROGRAM_ID, } from "@solana/spl-token";

async function main(feePayer: Keypair) {
    const args = process.argv.slice(2);
    const connection = new Connection("https://api.devnet.solana.com", {
        commitment: "confirmed",
    });

    const progId = new PublicKey(args[0]!);

    initializeClient(progId, connection);


    /**
     * Create a keypair for the Issue certifiate
     */
    const issue = Keypair.generate();
    console.info("**** Issue Certificate Address  ****");
    console.info(issue.publicKey.toBase58());

    /**
     * Create two wallets claim and transfer certificate
     */
    const student = Keypair.generate();
    console.info("**** student Wallet ****");
    console.info(student.publicKey.toBase58());

    const issuerWallet = Keypair.generate();
    console.info("**** Issuer Wallet ****");
    console.info(issuerWallet.publicKey.toBase58());

    const rent = await getMinimumBalanceForRentExemptAccount(connection);
    await sendAndConfirmTransaction(
        connection,
        new Transaction()
            .add(
                SystemProgram.createAccount({
                    fromPubkey: feePayer.publicKey,
                    newAccountPubkey: student.publicKey,
                    space: 0,
                    lamports: rent,
                    programId: SystemProgram.programId,
                }),
            )
            .add(
                SystemProgram.createAccount({
                    fromPubkey: feePayer.publicKey,
                    newAccountPubkey: issuerWallet.publicKey,
                    space: 0,
                    lamports: rent,
                    programId: SystemProgram.programId,
                }),
            ),
        [feePayer, student, issuerWallet],
    );

    /**
     * NFT certificate metadata
     */
    const [certificatePub] = deriveCertificateMetadataPDA(
        {
            mint: issue.publicKey,
        },
        progId,
    );
    console.info("**** Certificate Metadata Address ****");
    console.info(certificatePub.toBase58());

    /**
     * This account will be
     * holding the minted  NFT certificate.
     */
    const [studentATA] = CslSplTokenPDAs.deriveAccountPDA({
        wallet: student.publicKey,
        mint: issue.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
    });
    console.info("**** student ATA ****");
    console.info(studentATA.toBase58());

    /**
     * This account will be
     * holding the minted certificate NFT transfer it
     */
    const [issuerATA] = CslSplTokenPDAs.deriveAccountPDA({
        wallet: issuerWallet.publicKey,
        mint: issue.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
    });
    console.info("**** Issuer ATA ****");
    console.info(issuerATA.toBase58());

    /**
     * Issue  NFT Certificate into students's wallet  
     */
    console.info("**** Issue certificate ****");
    await issueCertificateSendAndConfirm({
        wallet: student.publicKey,
        assocTokenAccount: studentATA,
        certificateImageUrl: "https://nftstorage.link/ipfs/bafybeifxizqlkd6yk5dbwimbykpyhaut4uk3ye6vvpnvqykinhecotnbxe/JohnDoe.png",
        courseDescription: "Solana Bootcamp, hosted on the Risein platform",
        courseName: "Solana Bootcamp",
        studentName: "Jaydip Patel",
        signers: {
            feePayer: feePayer,
            funding: feePayer,
            mint: issue,
            owner: student,
        },
    });
    /**
     * Get the issued  certificate
     */
    let issueAccount = await getMint(connection, issue.publicKey);
    console.info("**** Issued ****");
    console.info(issueAccount);

    /**
     * Get the certificate Metadata
     */
    let certMetadata = await getCertificateMetadata(certificatePub);
    console.info("**** Certificate Metadata  ****");
    console.info(certMetadata);
    console.assert(certMetadata!.assocAccount!.toBase58(), studentATA.toBase58());

    /**
     * Claim students NFT  certificate 
     */
    console.info("**** Claiming... ****");
    await claimCertificateSendAndConfirm({
        wallet: issuerWallet.publicKey,
        claim: issue.publicKey,
        assocTokenAccount: issuerATA,
        mint: issue.publicKey,
        source: studentATA,
        destination: issuerATA,
        signers: {
            feePayer: feePayer,
            funding: feePayer,
            authority: student,
        },
    });

    /**
     * Get the claimed certificate
     */
    issueAccount = await getMint(connection, issue.publicKey);
    console.info("**** Claimed ****");
    console.info(issueAccount);

    /**
     * Get the Cert Metadata
     */
    certMetadata = await getCertificateMetadata(certificatePub);
    console.info("**** cert Metadata ****");
    console.info(certMetadata);
    console.assert(certMetadata!.assocAccount!.toBase58(), issuerATA.toBase58());

    await transferCertificateSendAndConfirm({
        wallet: student.publicKey,
        assocTokenAccount: studentATA,
        mint: issue.publicKey,
        source: issuerATA,
        destination: studentATA,
        signers: {
            feePayer: feePayer,
            funding: feePayer,
            authority: issuerWallet,
        },
    });

    /**
     * Burn the NFT
     */
    console.info("**** Burning... ****");
    await burnCertificateSendAndConfirm({
        mint: issue.publicKey,
        wallet: student.publicKey,
        signers: {
            feePayer: feePayer,
            owner: student,
        },
    });
    console.info("**** Burned ****");

    /**
     * Get the minted token
     */
    issueAccount = await getMint(connection, issue.publicKey);
    console.info("**** Burned certificate ****");
    console.info(issueAccount);

    /**
     * Get the Certificate Metadata
     */
    certMetadata = await getCertificateMetadata(certificatePub);
    console.info("**** Certificate Metadata ****");
    console.info(certMetadata);
    console.assert(typeof certMetadata!.assocAccount, "undefined");
}

fs.readFile(path.join(os.homedir(), ".config/solana/id.json")).then((file) =>
    main(Keypair.fromSecretKey(new Uint8Array(JSON.parse(file.toString())))),
);


```
# Then run the app.ts file with Prject ID

```javascript
 npx ts-node app.ts program Id  
```