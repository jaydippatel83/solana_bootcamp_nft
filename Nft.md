## Rise In Solana NFT Program   

**This Solana program creates an NFT representing a Gem. This Gem can be collected in a video game, and we'll be defining its properties as color, rarity, and a short description.**

# Instructions

**1. Mint:  The mint instruction is responsible for creating NFT. This process is essential for introducing new tokens into the system. Based on the inputs we have (regarding color, description, and rarity), we will create gem metadata and mint our NFT.**

**2. Transfer: The transfer instruction allows tokens or NFTs to be sent from one account to another.** 

**3. Burn: The burn instruction is used to destroy tokens or NFTs, removing them from circulation.** 

# This is the risein yaml file

```yaml

    cidl: "0.8"
info:
  name: nft
  title: RiseIn NFT
  version: 0.0.1
  license:
    name: Unlicense
    identifier: Unlicense
types:
  GemMetadata:
    solana:
      seeds:
        - name: "gem"
        - name: mint
          type: sol:pubkey
    fields:
      - name: color
        type: string
        solana:
          attributes: [ cap:16 ]
      - name: rarity
        type: string
        solana:
          attributes: [ cap:16 ]
      - name: short_description
        type: string
        solana:
          attributes: [ cap:255 ]
      - name: mint
        type: sol:pubkey
      - name: assoc_account
        type: rs:option<sol:pubkey>
methods:
  - name: mint
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
      - name: gem
        type: GemMetadata
        solana:
          attributes: [ init ]
          seeds:
            mint: mint
      - name: color
        type: string
      - name: rarity
        type: string
      - name: short_description
        type: string
  - name: transfer
    uses:
      - csl_spl_assoc_token.create
      - csl_spl_token.transfer_checked
    inputs:
      - name: mint
        type: csl_spl_token.Mint
      - name: gem
        type: GemMetadata
        solana:
          attributes: [ mut ]
          seeds:
            mint: mint
  - name: burn
    uses:
      - csl_spl_token.burn
    inputs:
      - name: mint
        type: csl_spl_token.Mint
      - name: gem
        type: GemMetadata
        solana:
          attributes: [ mut ]
          seeds:
            mint: mint
```

# To generate code

```javascript
    codigo solana generate risein.yaml
```

# Step 1: Mint Function

```javascript

    pub fn mint(
            program_id: &Pubkey,
            for_initialize_mint_2: &[&AccountInfo],
            for_create: &[&AccountInfo],
            for_mint_to: &[&AccountInfo],
            for_set_authority: &[&AccountInfo],
            mint: &Account<spl_token::state::Mint>,
            gem: &mut AccountPDA<GemMetadata>,
            funding: &AccountInfo,
            assoc_token_account: &AccountInfo,
            wallet: &AccountInfo,
            owner: &AccountInfo,
            color: String,
            rarity: String,
            short_description: String,
        ) -> ProgramResult {
            gem.data.color = color;
            gem.data.rarity = rarity;
            gem.data.short_description = short_description;
            gem.data.mint = *mint.info.key;
            gem.data.assoc_account = Some(*assoc_token_account.key);

            csl_spl_token::src::cpi::initialize_mint_2(for_initialize_mint_2, 0, *wallet.key, None)?;
            csl_spl_assoc_token::src::cpi::create(for_create)?;
            csl_spl_token::src::cpi::mint_to(for_mint_to, 1)?;
            csl_spl_token::src::cpi::set_authority(for_set_authority, 0, None)?;

            Ok(())
     }
```

# Step 2: Implement Transfer

```javascript

    pub fn transfer(
            program_id: &Pubkey,
            for_create: &[&AccountInfo],
            for_transfer_checked: &[&AccountInfo],
            mint: &Account<spl_token::state::Mint>,
            gem: &mut AccountPDA<GemMetadata>,
            funding: &AccountInfo,
            assoc_token_account: &AccountInfo,
            wallet: &AccountInfo,
            source: &AccountInfo,
            destination: &AccountInfo,
            authority: &AccountInfo,
        ) -> ProgramResult {
            gem.data.assoc_account = Some(*destination.key);

            // Create the ATA account for new owner if it hasn't been created
            if assoc_token_account.lamports() == 0 {
                csl_spl_assoc_token::src::cpi::create(for_create)?;
            }

            csl_spl_token::src::cpi::transfer_checked(for_transfer_checked, 1, 0)?;

            Ok(())
        }
```

# Step 3: Implement Burn

```javascript
        pub fn burn(
            program_id: &Pubkey,
            for_burn: &[&AccountInfo],
            mint: &Account<spl_token::state::Mint>,
            gem: &mut AccountPDA<GemMetadata>,
            account: &AccountPDA<spl_token::state::Account>,
            owner: &AccountInfo,
            wallet: &AccountInfo,
        ) -> ProgramResult {
            gem.data.assoc_account = None;
            csl_spl_token::src::cpi::burn(for_burn, 1)?;

            Ok(())
        } 

```

# After this build program using command

```javascript

   cargo build-sbf

```

# Setup the config file 

```javascript
solana config set --url devnet
```

# Then deploy the program 
**go to program directory**
```javascript
solana program deploy target/deploy/risein.so 

```

# Here is the app.ts file for Test functionality with frontend

```javascript

import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, } from "@solana/web3.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import {
    burnSendAndConfirm,
    CslSplTokenPDAs,
    deriveGemMetadataPDA,
    getGemMetadata,
    initializeClient,
    mintSendAndConfirm,
    transferSendAndConfirm,
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
     * Create a keypair for the mint
     */
    const mint = Keypair.generate();
    console.info("+==== Mint Address  ====+");
    console.info(mint.publicKey.toBase58());

    /**
     * Create two wallets
     */
    const johnDoeWallet = Keypair.generate();
    console.info("+==== John Doe Wallet ====+");
    console.info(johnDoeWallet.publicKey.toBase58());

    const janeDoeWallet = Keypair.generate();
    console.info("+==== Jane Doe Wallet ====+");
    console.info(janeDoeWallet.publicKey.toBase58());

    const rent = await getMinimumBalanceForRentExemptAccount(connection);
    await sendAndConfirmTransaction(
        connection,
        new Transaction()
            .add(
                SystemProgram.createAccount({
                    fromPubkey: feePayer.publicKey,
                    newAccountPubkey: johnDoeWallet.publicKey,
                    space: 0,
                    lamports: rent,
                    programId: SystemProgram.programId,
                }),
            )
            .add(
                SystemProgram.createAccount({
                    fromPubkey: feePayer.publicKey,
                    newAccountPubkey: janeDoeWallet.publicKey,
                    space: 0,
                    lamports: rent,
                    programId: SystemProgram.programId,
                }),
            ),
        [feePayer, johnDoeWallet, janeDoeWallet],
    );

    /**
     * Derive the Gem Metadata so we can retrieve it later
     */
    const [gemPub] = deriveGemMetadataPDA(
        {
            mint: mint.publicKey,
        },
        progId,
    );
    console.info("+==== Gem Metadata Address ====+");
    console.info(gemPub.toBase58());

    /**
     * Derive the John Doe's Associated Token Account, this account will be
     * holding the minted NFT.
     */
    const [johnDoeATA] = CslSplTokenPDAs.deriveAccountPDA({
        wallet: johnDoeWallet.publicKey,
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
    });
    console.info("+==== John Doe ATA ====+");
    console.info(johnDoeATA.toBase58());

    /**
     * Derive the Jane Doe's Associated Token Account, this account will be
     * holding the minted NFT when John Doe transfer it
     */
    const [janeDoeATA] = CslSplTokenPDAs.deriveAccountPDA({
        wallet: janeDoeWallet.publicKey,
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
    });
    console.info("+==== Jane Doe ATA ====+");
    console.info(janeDoeATA.toBase58());

    /**
     * Mint a new NFT into John's wallet (technically, the Associated Token Account)
     */
    console.info("+==== Minting... ====+");
    await mintSendAndConfirm({
        wallet: johnDoeWallet.publicKey,
        assocTokenAccount: johnDoeATA,
        color: "Purple",
        rarity: "Rare",
        shortDescription: "Only possible to collect from the lost temple event",
        signers: {
            feePayer: feePayer,
            funding: feePayer,
            mint: mint,
            owner: johnDoeWallet,
        },
    });
    console.info("+==== Minted ====+");

    /**
     * Get the minted token
     */
    let mintAccount = await getMint(connection, mint.publicKey);
    console.info("+==== Mint ====+");
    console.info(mintAccount);

    /**
     * Get the Gem Metadata
     */
    let gem = await getGemMetadata(gemPub);
    console.info("+==== Gem Metadata ====+");
    console.info(gem);
    console.assert(gem!.assocAccount!.toBase58(), johnDoeATA.toBase58());

    /**
     * Transfer John Doe's NFT to Jane Doe Wallet (technically, the Associated Token Account)
     */
    console.info("+==== Transferring... ====+");
    await transferSendAndConfirm({
        wallet: janeDoeWallet.publicKey,
        assocTokenAccount: janeDoeATA,
        mint: mint.publicKey,
        source: johnDoeATA,
        destination: janeDoeATA,
        signers: {
            feePayer: feePayer,
            funding: feePayer,
            authority: johnDoeWallet,
        },
    });
    console.info("+==== Transferred ====+");

    /**
     * Get the minted token
     */
    mintAccount = await getMint(connection, mint.publicKey);
    console.info("+==== Mint ====+");
    console.info(mintAccount);

    /**
     * Get the Gem Metadata
     */
    gem = await getGemMetadata(gemPub);
    console.info("+==== Gem Metadata ====+");
    console.info(gem);
    console.assert(gem!.assocAccount!.toBase58(), janeDoeATA.toBase58());

    /**
     * Burn the NFT
     */
    console.info("+==== Burning... ====+");
    await burnSendAndConfirm({
        mint: mint.publicKey,
        wallet: janeDoeWallet.publicKey,
        signers: {
            feePayer: feePayer,
            owner: janeDoeWallet,
        },
    });
    console.info("+==== Burned ====+");

    /**
     * Get the minted token
     */
    mintAccount = await getMint(connection, mint.publicKey);
    console.info("+==== Mint ====+");
    console.info(mintAccount);

    /**
     * Get the Gem Metadata
     */
    gem = await getGemMetadata(gemPub);
    console.info("+==== Gem Metadata ====+");
    console.info(gem);
    console.assert(typeof gem!.assocAccount, "undefined");
}

fs.readFile(path.join(os.homedir(), ".config/solana/id.json")).then((file) =>
    main(Keypair.fromSecretKey(new Uint8Array(JSON.parse(file.toString())))),
);


```
# Then run the app.ts file

```javascript
 npx ts-node app.ts program Id  
```