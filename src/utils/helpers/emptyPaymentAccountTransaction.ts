import { programs } from "@metaplex/js";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
// import { NATIVE_MINT } from "@solana/spl-token";

const { serialize } = require("borsh");
const splToken = require("@solana/spl-token");
const METAPLEX_PREFIX = "metaplex";
const metaplexProgramId = "p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98";

const WrappedSolMint = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
const NATIVE_MINT = new PublicKey(
  process.env.REACT_APP_CUSTOM_NATIVE_MINT || ""
);

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

export const emptyPaymentAccountFunc = async ({
  connection,
  vault,
  wallet,
  acceptPaymentAcc,
  nftMetadata,
  tokenMint,
  store,
  tokenTracker,
}: any) => {
  const auctionPDA = await programs.auction.Auction.getPDA(vault);
  const auctionManagerPDA = await programs.metaplex.AuctionManager.getPDA(
    auctionPDA
  );
  const loadedVault = await programs.vault.Vault.load(connection, vault);
  const sdb = await loadedVault.getSafetyDepositBoxes(connection);
  const safetyDepositConfigKey =
    await programs.metaplex.SafetyDepositConfig.getPDA(
      auctionManagerPDA,
      sdb[0].pubkey
    );
  let allinstructions: any = [];
  const auctionManagerData = await programs.metaplex.AuctionManager.load(
    connection,
    auctionManagerPDA
  );

  const addresses: any = [];
  const wrappedSolAccs: any = [];
  const claimingTransactionTxId: any = [];
  const metadatinfo = await programs.metadata.Metadata.findByMint(
    connection,
    tokenMint
  );
  const creatorArray = metadatinfo.data.data.creators!;
  if (creatorArray.length > 0) {
    for (let i = 0; i < creatorArray.length; i++) {
      addresses.push({ key: creatorArray[i].address, value: i });
    }
  }
  let ataOwnerDict: any = {};
  let ataLookup: any = [];

  addresses.push({ key: auctionManagerData.data.authority, value: null });
  for (let i = 0; i < addresses.length; i++) {
    // let settleInstructions = [];//: TransactionInstruction[] = [];

    const ata = (
      await PublicKey.findProgramAddress(
        [
          new PublicKey(addresses[i].key).toBuffer(),
          splToken.TOKEN_PROGRAM_ID.toBuffer(),
          NATIVE_MINT.toBuffer(),
        ],
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];

    const ata_address = ata.toBase58();

    // ataOwnerDict[ata_address] = addresses[i].key;
    ataOwnerDict[addresses[i].key] = ata_address;
    wrappedSolAccs.push(ata.toBase58());

    const existingAta = await connection.getAccountInfo(ata);
    if (!existingAta && !ataLookup[ata.toBase58()]) {
      createAssociatedTokenAccountInstruction(
        allinstructions,
        ata, //associated account address
        wallet.publicKey, //payer
        new PublicKey(addresses[i].key), //receiver wallet address
        NATIVE_MINT
      );
    }
    ataLookup[ata.toBase58()] = true;
    const emptyPaymentAccountIntructionResponse =
      await emptyPaymentAccountIntruction({
        connection,
        acceptPaymentAccount: acceptPaymentAcc,
        ata,
        wallet, // payer here
        recipient: addresses[i].key, //receiver of payment here
        auctionManager: auctionManagerPDA.toBase58(),
        metadata: nftMetadata,
        vault,
        store,
        auction: auctionPDA.toBase58(),
        tokenTracker: tokenTracker,
        safetyDepositConfig: safetyDepositConfigKey,
        manualTransaction: allinstructions,
        winningConfigIndex: 0,
        winningConfigItemIndex: 0,
        creatorIndex: addresses[i].value,
        safetyDepositBox: sdb[0].pubkey.toBase58(),
      });
  }
  return {
    wrappedSolAccs,
    instructions: allinstructions,
    signers: [],
    ataOwnerDict,
  };
};

export {
  emptyPaymentAccountIntruction,
  createAssociatedTokenAccountInstruction,
};
