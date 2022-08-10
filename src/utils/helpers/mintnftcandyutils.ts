// const anchor = require("@project-serum/anchor")
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { NodeWallet, actions, programs } from '@metaplex/js';
const splToken = require("@solana/spl-token");

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const getTokenWallet = async function (wallet: any, mint: any) {
    return (await PublicKey.findProgramAddress([wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID))[0];
};


function createAssociatedTokenAccountInstruction(associatedTokenAddress: any, payer: any, walletAddress: any, splTokenMintAddress: any) {
    const keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([]),
    });
}

function createMetadataInstruction(metadataAccount: any, mint: any, mintAuthority: any, payer: any, updateAuthority: any, txnData: any) {
    const keys = [
        {
            pubkey: metadataAccount,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: mint,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: mintAuthority,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: payer,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: updateAuthority,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: TOKEN_METADATA_PROGRAM_ID,
        data: txnData,
    });
}

function createMasterEditionInstruction(metadataAccount: any, editionAccount: any, mint: any, mintAuthority: any, payer: any, updateAuthority: any, txnData: any) {
    const keys = [
        {
            pubkey: editionAccount,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: mint,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: updateAuthority,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: mintAuthority,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: payer,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: metadataAccount,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: TOKEN_METADATA_PROGRAM_ID,
        data: txnData,
    });
}


const getMetadata = async (mint: any) => {
    return (await PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
    ], TOKEN_METADATA_PROGRAM_ID))[0];
};

const getMasterEdition = async (mint: any) => {
    return (await PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
    ], TOKEN_METADATA_PROGRAM_ID))[0];
};

export {
    getTokenWallet,
    createAssociatedTokenAccountInstruction,
    getMetadata,
    createMetadataInstruction,
    getMasterEdition,
    createMasterEditionInstruction
}