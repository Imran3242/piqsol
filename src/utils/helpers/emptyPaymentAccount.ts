import { programs } from "@metaplex/js";
import { Token } from "@solana/spl-token";
import { Wallet, WalletContextState } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  Connection,
} from "@solana/web3.js";

const { serialize } = require("borsh");
const splToken = require("@solana/spl-token");
const METAPLEX_PREFIX = "metaplex";
const metaplexProgramId = "p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98";

class EmptyPaymentAccountArgs {
  instruction = 7;
  winningConfigIndex: number | null;
  winningConfigItemIndex: number | null;
  creatorIndex: number | null;
  constructor(args: {
    winningConfigIndex: number | null;
    winningConfigItemIndex: number | null;
    creatorIndex: number | null;
  }) {
    this.winningConfigIndex = args.winningConfigIndex;
    this.winningConfigItemIndex = args.winningConfigItemIndex;
    this.creatorIndex = args.creatorIndex;
  }
}

//@ts-ignore
const SCHEMA = new Map<any, any>([
  [
    EmptyPaymentAccountArgs,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["winningConfigIndex", { kind: "option", type: "u8" }],
        ["winningConfigItemIndex", { kind: "option", type: "u8" }],
        ["creatorIndex", { kind: "option", type: "u8" }],
      ],
    },
  ],
]);

const getPayoutTicket = async ({
  auctionManager,
  winningConfigIndex,
  winningConfigItemIndex,
  creatorIndex,
  safetyDepositBox,
  recipient,
}: any) => {
  let payoutTickerAcc = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(METAPLEX_PREFIX),
        new PublicKey(auctionManager).toBuffer(),
        Buffer.from(
          winningConfigIndex !== null && winningConfigIndex !== undefined
            ? winningConfigIndex.toString()
            : "participation"
        ),
        Buffer.from(
          winningConfigItemIndex !== null &&
            winningConfigItemIndex !== undefined
            ? winningConfigItemIndex.toString()
            : "0"
        ),
        Buffer.from(
          creatorIndex !== null && creatorIndex !== undefined
            ? creatorIndex.toString()
            : "auctioneer"
        ),
        new PublicKey(safetyDepositBox).toBuffer(),
        new PublicKey(recipient).toBuffer(),
      ],
      new PublicKey(metaplexProgramId)
    )
  )[0];
  return payoutTickerAcc;
};

const emptyPaymentAccountIntruction = async ({
  connection,
  acceptPaymentAccount,
  ata,
  wallet,
  recipient,
  auctionManager,
  metadata,
  vault,
  store,
  auction,
  tokenTracker,
  safetyDepositConfig,
  manualTransaction,
  winningConfigIndex,
  winningConfigItemIndex,
  creatorIndex,
  safetyDepositBox,
}: any) => {
  const value = new EmptyPaymentAccountArgs({
    winningConfigIndex: winningConfigIndex,
    winningConfigItemIndex: winningConfigItemIndex,
    creatorIndex: creatorIndex,
  });

  const loadedVault = await programs.vault.Vault.load(connection, vault);
  const sdb = await loadedVault.getSafetyDepositBoxes(connection);
  const data = Buffer.from(serialize(SCHEMA, value));
  const keys = [
    {
      pubkey: new PublicKey(acceptPaymentAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: ata,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: new PublicKey(auctionManager),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: await getPayoutTicket({
        auctionManager,
        winningConfigIndex,
        winningConfigItemIndex,
        creatorIndex,
        safetyDepositBox,
        recipient,
      }),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: new PublicKey(metadata),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: sdb[0].pubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey(store),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey(vault),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey(auction),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splToken.TOKEN_PROGRAM_ID,
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
    {
      pubkey: new PublicKey(tokenTracker),
      isSigner: false,
      isWritable: false,
    },

    {
      pubkey: new PublicKey(safetyDepositConfig),
      isSigner: false,
      isWritable: false,
    },
  ];

  manualTransaction.push(
    new TransactionInstruction({
      keys,
      programId: new PublicKey(metaplexProgramId),
      // programId: new PublicKey("6VNKBN9rCg2G2T4oKj8j1JgsH4eMMvK4pPnJCvA2rrFH"),
      data: data,
    })
  );
};

function createAssociatedTokenAccountInstruction(
  instructions: TransactionInstruction[],
  associatedTokenAddress: PublicKey,
  payer: PublicKey,
  walletAddress: PublicKey,
  splTokenMintAddress: PublicKey
) {
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
      pubkey: splToken.TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      data: Buffer.from([]),
    })
  );
}

const closeAssociatedAccount = async ({
  emptyAcckey,
  wallet,
  connection,
}: any) => {
  let instruction = Token.createCloseAccountInstruction(
    splToken.TOKEN_PROGRAM_ID,
    new PublicKey(emptyAcckey), //account to be closed
    wallet.publicKey, //remaining balance transfer
    wallet.publicKey, //authority/owner of closing account
    []
  );
  const transaction = new Transaction().add(instruction);

  let recentBlockhash = (await connection.getLatestBlockhash("finalized"))
    .blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = recentBlockhash;
  const signedTransaction = await wallet.signTransaction(transaction);
  const rawTransaction = signedTransaction.serialize();
  const txResponse = await connection.sendRawTransaction(rawTransaction);
  // const tx = await web3.sendAndConfirmTransaction(
  //   connection,
  //   transaction,
  //   [owner]
  // );
  return txResponse;
};

export {
  emptyPaymentAccountIntruction,
  createAssociatedTokenAccountInstruction,
  closeAssociatedAccount,
};
