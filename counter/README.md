## Rise In Solana Counter Program  

# Homework#1 : Reset Function for counter program

**This is a simple Solana program that demonstrates how to interact with a counter stored in a greeting account on the Solana blockchain. The program allows you to increment, decrement, and reset the counter, and it provides a basic test case to ensure that the operations work as expected.**

**This is counter yaml file** 
```yaml
    cidl: "0.8"
info:
  name: counter
  title: Patika Counter
  version: 0.0.1
  license:
    name: Unlicense
    identifier: Unlicense
types:
  GreetingAccount:
    fields:
      - name: counter
        type: u32
methods:
  - name: increment
    inputs: 
      - name: greeting_account
        type: GreetingAccount
        solana:
          attributes: [mut, init_if_needed]
  - name: decrement
    inputs: 
      - name: greeting_account
        type: GreetingAccount
        solana:
          attributes: [mut, init_if_needed]
  - name: reset
    inputs: 
      - name: greeting_account
        type: GreetingAccount
        solana: 
          attributes: [mut, init_if_needed]
```

# To generate code

```javascript
    codigo solana generate counter.yaml
```

# Task 2: Add the increment codes  
**Let’s implement the business logic for decrement instruction**

```rust 
        pub fn increment(
            program_id: &Pubkey,
            greeting_account: &mut Account<GreetingAccount>,
        ) -> ProgramResult {
            greeting_account.data.counter += 1;
            Ok(())
        }   
```

# Task 3: Add the Decrement codes  
**Let’s implement the business logic for decrement instruction**

```rust
 pub fn decrement(
            program_id: &Pubkey,
            greeting_account: &mut Account<GreetingAccount>,
        ) -> ProgramResult {
            greeting_account.data.counter -= 1;

            Ok(())
        }

```

# Task 4: Add the Reset codes  
**Let’s implement the business logic for Reset instruction**

```rust
  pub fn reset(
            program_id: &Pubkey,
            greeting_account: &mut Account<GreetingAccount>,
        ) -> ProgramResult {
            greeting_account.data.counter = 0;
            Ok(())
        }

```

# after this run this command to build program

```javascript

   cargo build-sbf

```

# setup the config file 

```javascript
solana config set --url devnet
```

# Then deploy the program 
**go to progrm directory**
```javascript
solana program deploy target/deploy/counter.so 

```

# Here is the app.ts file for Test functionality with frontend

```javascript

import {
    getGreetingAccount,
    incrementSendAndConfirm,
    decrementSendAndConfirm,
    resetSendAndConfirm, // Add reset function
    initializeClient,
} from "./index";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

async function main(feePayer: Keypair) {
    const args = process.argv.slice(2);
    const connection = new Connection("https://api.devnet.solana.com", {
        commitment: "confirmed",
    });
    const progId = new PublicKey(args[0]!);

    initializeClient(progId, connection);

    // 0. Create keypair for the Greeting account
    const greetingAccount = Keypair.generate();
    console.info("+==== Greeting Address  ====+");
    console.info(greetingAccount.publicKey.toBase58());

    // 1. Increment the counter by 1
    await incrementSendAndConfirm({ signers: { feePayer, greetingAccount } });
    let incremented_account = await getGreetingAccount(greetingAccount.publicKey);

    // 2. Decrement the count by 1
    await decrementSendAndConfirm({ signers: { feePayer, greetingAccount } });
    let decremented_account = await getGreetingAccount(greetingAccount.publicKey);

    // 3. Decrement the count by 1 again
    await decrementSendAndConfirm({ signers: { feePayer, greetingAccount } });
    let decremented_account2 = await getGreetingAccount(greetingAccount.publicKey);

    // 4. Reset the counter to 0
    await resetSendAndConfirm({ signers: { feePayer, greetingAccount } });
    let reset_account = await getGreetingAccount(greetingAccount.publicKey);

    console.log(
        (incremented_account?.counter ?? 0) - 1 === (decremented_account2?.counter ?? -1),
        "Counter after increment and decrement is as expected."
    );

    console.log(
        (reset_account?.counter ?? 0) === 0,
        "Counter after reset is 0."
    );
}

fs.readFile(path.join(os.homedir(), ".config/solana/id.json")).then((file) =>
    main(Keypair.fromSecretKey(new Uint8Array(JSON.parse(file.toString())))
    )
);


```
# then run the app.ts file

```javascript
 npx ts-node app.ts program Id

+==== Mint Address  ====+
8fdPhYDSaRbqMZi3HSomSEhfVhscmj1xnJdW4ELV7JLA
+==== John Doe Wallet ====+
5Yr4Zqtx54xPfwcG9HQo1cbc69dsMtUuG5XpByhj7HnB
+==== Jane Doe Wallet ====+
7LZgn4hTZEPoMWFMjSWfWH1Tou1qBRnT6CTHHBkPw8qg
+==== Gem Metadata Address ====+
JCvVLFrsxsh2QwGG6PxPfUsyubtLupdxhz7Wj2x52SRB
+==== John Doe ATA ====+
FCVSdBQiEwfC52JUPEMBEFk9bTgdqPtoZHVMj71tazBm
+==== Jane Doe ATA ====+
EESV5ocjUtboyDNE8JwasXFXeZbN1Kp2nAcP6v3Zf8o1
+==== Minting... ====+
+==== Minted ====+
+==== Mint ====+
{
  address: PublicKey [PublicKey(8fdPhYDSaRbqMZi3HSomSEhfVhscmj1xnJdW4ELV7JLA)] {
    _bn: <BN: 71e706ee35f2f731ac3c47509a9d894c8e16451ecafe62f866c68b00e705db0b>
  },
  mintAuthority: null,
  supply: 1n,
  decimals: 0,
  isInitialized: true,
  freezeAuthority: null,
  tlvData: <Buffer >
}
+==== Gem Metadata ====+
{
  color: 'Purple',
  rarity: 'Rare',
  shortDescription: 'Only possible to collect from the lost temple event',
  mint: PublicKey [PublicKey(8fdPhYDSaRbqMZi3HSomSEhfVhscmj1xnJdW4ELV7JLA)] {
    _bn: <BN: 71e706ee35f2f731ac3c47509a9d894c8e16451ecafe62f866c68b00e705db0b>
  },
  assocAccount: PublicKey [PublicKey(FCVSdBQiEwfC52JUPEMBEFk9bTgdqPtoZHVMj71tazBm)] {
    _bn: <BN: d2f52a4428d72c8b4663363c9b2e0ddace49d893575ae9988c6f46d36760f34c>
  }
}
+==== Transferring... ====+
+==== Transferred ====+
+==== Mint ====+
{
  address: PublicKey [PublicKey(8fdPhYDSaRbqMZi3HSomSEhfVhscmj1xnJdW4ELV7JLA)] {
    _bn: <BN: 71e706ee35f2f731ac3c47509a9d894c8e16451ecafe62f866c68b00e705db0b>
  },
  mintAuthority: null,
  supply: 1n,
  decimals: 0,
  isInitialized: true,
  freezeAuthority: null,
  tlvData: <Buffer >
}
+==== Gem Metadata ====+
{
  color: 'Purple',
  rarity: 'Rare',
  shortDescription: 'Only possible to collect from the lost temple event',
  mint: PublicKey [PublicKey(8fdPhYDSaRbqMZi3HSomSEhfVhscmj1xnJdW4ELV7JLA)] {
    _bn: <BN: 71e706ee35f2f731ac3c47509a9d894c8e16451ecafe62f866c68b00e705db0b>
  },
  assocAccount: PublicKey [PublicKey(EESV5ocjUtboyDNE8JwasXFXeZbN1Kp2nAcP6v3Zf8o1)] {
    _bn: <BN: c4994bade5abdcc6819f156c9a225a5d48c0a0ee8caf7a580df473d6d77d1558>
  }
}
+==== Burning... ====+
+==== Burned ====+
+==== Mint ====+
{
  address: PublicKey [PublicKey(8fdPhYDSaRbqMZi3HSomSEhfVhscmj1xnJdW4ELV7JLA)] {
    _bn: <BN: 71e706ee35f2f731ac3c47509a9d894c8e16451ecafe62f866c68b00e705db0b>
  },
  mintAuthority: null,
  supply: 0n,
  decimals: 0,
  isInitialized: true,
  freezeAuthority: null,
  tlvData: <Buffer >
}
+==== Gem Metadata ====+
{
  color: 'Purple',
  rarity: 'Rare',
  shortDescription: 'Only possible to collect from the lost temple event',
  mint: PublicKey [PublicKey(8fdPhYDSaRbqMZi3HSomSEhfVhscmj1xnJdW4ELV7JLA)] {
    _bn: <BN: 71e706ee35f2f731ac3c47509a9d894c8e16451ecafe62f866c68b00e705db0b>
  },
  assocAccount: undefined
}

```



