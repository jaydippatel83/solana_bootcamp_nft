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
