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

# After this build program using command

```javascript

   cargo build-sbf

```

# setup the config file 

```javascript
solana config set --url devnet
```

# Then deploy the program 
**go to program directory**
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
# Then run the app.ts file

```javascript
 npx ts-node app.ts program Id  
```



