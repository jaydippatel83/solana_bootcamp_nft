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
