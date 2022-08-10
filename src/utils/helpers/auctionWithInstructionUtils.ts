import metaplex, {
  actions,
  programs,
  transactions,
  Connection,
  utils,
} from "@metaplex/js";
import {
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AccountLayout,
  MintLayout,
} from "@solana/spl-token";
import BN from "bn.js";
import { serialize } from "borsh";
import { AuctionManager, ClaimBid } from "@metaplex-foundation/mpl-metaplex";
import {
  PriceFloor,
  PriceFloorType,
  WinnerLimit,
  WinnerLimitType,
  Auction,
  AuctionExtended,
  BidderPot,
  BidderMetadata,
} from "@metaplex-foundation/mpl-auction";
import { findAta, payTax } from "utils/helpers/customTokenAuctionUtils";
import { endpoint } from "./getChainNetwork";
import { createAssociatedTokenAccountInstruction } from "../../utils/helpers/emptyPaymentAccountTransaction";
import { WithdrawTokenFromSafetyDepositBox } from "@metaplex-foundation/mpl-token-vault";
import { sendTransactionsSmart } from "./auctionTransactionHelper";
import { ReclaimFullRightsTransferBid } from "../../utils/helpers/reclaimItemUtils";

const toPublicKey = (key: any) => new PublicKey(key);
const LAMPORT_BASE = new BN(LAMPORTS_PER_SOL);
const auctionProgramId = "auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8";
const vaultProgramId = "vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn";
const metaplexProgramId = "p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98";
const metadataProgramId = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const splToken = require("@solana/spl-token");
const web3 = require("@solana/web3.js");

const WrappedSolMint = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
const NATIVE_MINT = new PublicKey(
  process.env.REACT_APP_CUSTOM_NATIVE_MINT || ""
);

function getPriceFloor(priceTokens: any): PriceFloor {
  const priceFloor = new PriceFloor({
    type: PriceFloorType.Minimum,
    minPrice: priceTokens,
  });
  return priceFloor;
}

export const createExternalPriceTransaction = async ({
  connection,
  wallet,
}: any) => {
  const txOptions = { feePayer: wallet.publicKey };
  let instructions = [],
    signers = [];
  const epaRentExempt = await connection.getMinimumBalanceForRentExemption(
    programs.vault.Vault.MAX_EXTERNAL_ACCOUNT_SIZE
  );

  const externalPriceAccount = Keypair.generate();
  const externalPriceAccountData = new programs.vault.ExternalPriceAccountData({
    pricePerShare: new BN(0),
    priceMint: NATIVE_MINT.toBase58(),
    allowedToCombine: true,
  });
  const uninitializedEPA = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: externalPriceAccount.publicKey,
      lamports: epaRentExempt,
      space: programs.vault.Vault.MAX_EXTERNAL_ACCOUNT_SIZE,
      programId: programs.vault.VaultProgram.PUBKEY,
    })
  );
  const updateEPA = new programs.vault.UpdateExternalPriceAccount(txOptions, {
    externalPriceAccount: externalPriceAccount.publicKey,
    externalPriceAccountData,
  });

  instructions.push(uninitializedEPA);
  instructions.push(updateEPA);
  signers.push(externalPriceAccount);

  return {
    externalPriceAccount: externalPriceAccount.publicKey,
    priceMint: NATIVE_MINT,
    instructions: instructions,
    signers: signers,
  };
};

export const createVaultTransaction = async ({
  connection,
  externalPriceAccount,
  wallet,
}: any) => {
  let instructions = [],
    signers = [];
  const accountRent = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );
  const mintRent = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  );
  const vaultRent = await connection.getMinimumBalanceForRentExemption(
    programs.vault.Vault.MAX_VAULT_SIZE
  );

  const vault = Keypair.generate();
  const fractionMint = Keypair.generate();

  //creating fractional mint transaction
  const vaultAuthority = await programs.vault.Vault.getPDA(vault.publicKey);
  const fractionMintTx = new transactions.CreateMint(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: fractionMint.publicKey,
      lamports: mintRent,
      owner: vaultAuthority,
      freezeAuthority: vaultAuthority,
    }
  );

  instructions.push(fractionMintTx);
  signers.push(fractionMint);

  //creating redeem treasury transaction
  const redeemTreasury = Keypair.generate();
  const redeemTreasuryTx = new transactions.CreateTokenAccount(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: redeemTreasury.publicKey,
      lamports: accountRent,
      mint: NATIVE_MINT,
      owner: vaultAuthority,
    }
  );
  instructions.push(redeemTreasuryTx);
  signers.push(redeemTreasury);

  //creating fractional treasury transaction
  const fractionTreasury = Keypair.generate();
  const fractionTreasuryTx = new transactions.CreateTokenAccount(
    { feePayer: wallet.publicKey },
    {
      newAccountPubkey: fractionTreasury.publicKey,
      lamports: accountRent,
      mint: fractionMint.publicKey,
      owner: vaultAuthority,
    }
  );

  instructions.push(fractionTreasuryTx);
  signers.push(fractionTreasury);

  const uninitializedVaultTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: vault.publicKey,
      lamports: vaultRent,
      space: programs.vault.Vault.MAX_VAULT_SIZE,
      programId: programs.vault.VaultProgram.PUBKEY,
    })
  );

  instructions.push(uninitializedVaultTx);
  signers.push(vault);

  //init vault instruction
  const initVaultTx = new programs.vault.InitVault(
    { feePayer: wallet.publicKey },
    {
      vault: vault.publicKey,
      vaultAuthority: wallet.publicKey,
      fractionalTreasury: fractionTreasury.publicKey,
      pricingLookupAddress: externalPriceAccount,
      redeemTreasury: redeemTreasury.publicKey,
      fractionalMint: fractionMint.publicKey,
      allowFurtherShareCreation: true,
    }
  );

  instructions.push(initVaultTx);

  return {
    instructions,
    signers,
    vault: vault.publicKey,
    fractionMint: fractionMint.publicKey,
    redeemTreasury: redeemTreasury.publicKey,
    fractionTreasury: fractionTreasury.publicKey,
  };
};

export const createAddNftToVaultInstruction = async ({
  vault,
  nftKey,
  wallet,
}: any) => {
  const txOptions = { feePayer: wallet.publicKey };
  let connection = new Connection(endpoint.url, "confirmed");
  let instructions = [],
    signers = [];
  const safetyDepositTokenStores = [];

  const tokenAccounts = await connection.getTokenLargestAccounts(
    new PublicKey(nftKey)
  );

  const tokenProgramKey = tokenAccounts?.value[0]?.address || "";

  const vaultAuthority = await programs.vault.Vault.getPDA(vault);
  const accountRent = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );
  const safetyDepositBox = await programs.vault.SafetyDepositBox.getPDA(
    vault,
    toPublicKey(nftKey)
  );

  const tokenStoreAccount = Keypair.generate();
  const tokenStoreAccountTx = new transactions.CreateTokenAccount(txOptions, {
    newAccountPubkey: tokenStoreAccount.publicKey,
    lamports: accountRent,
    mint: toPublicKey(nftKey),
    owner: vaultAuthority,
  });

  instructions.push(tokenStoreAccountTx);
  signers.push(tokenStoreAccount);

  const { authority: transferAuthority, createApproveTx } =
    actions.createApproveTxs({
      account: toPublicKey(tokenProgramKey),
      owner: wallet.publicKey,
      amount: 1,
    });

  instructions.push(createApproveTx);
  signers.push(transferAuthority);

  const addTokenTx = new programs.vault.AddTokenToInactiveVault(txOptions, {
    vault,
    vaultAuthority: wallet.publicKey,
    tokenAccount: toPublicKey(tokenProgramKey),
    tokenStoreAccount: tokenStoreAccount.publicKey,
    transferAuthority: transferAuthority.publicKey,
    safetyDepositBox: safetyDepositBox,
    amount: new BN(1),
  });
  instructions.push(addTokenTx);

  return {
    instructions,
    signers,
    tokenStoreAccount: tokenStoreAccount.publicKey,
  };
};

export const createCloseVaultInstruction = async ({
  vault,
  wallet,
  fractionMint,
  fractionTreasury,
  redeemTreasury,
  pricingLookupAddress,
}: any) => {
  let instructions = [],
    signers = [];
  const txOptions = { feePayer: wallet.publicKey };

  const network = "devnet";
  let connection = new Connection(endpoint.url, "confirmed");
  let priceMint = NATIVE_MINT;
  const accountRent = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );

  const fractionMintAuthority = await programs.vault.Vault.getPDA(vault);

  const fractionMintKey = fractionMint;
  const fractionTreasuryKey = fractionTreasury;
  const redeemTreasuryKey = redeemTreasury;
  const pricingLookupAddressKey = pricingLookupAddress;

  const activateVaultTx = new programs.vault.ActivateVault(txOptions, {
    vault,
    numberOfShares: new BN(0),
    fractionMint: fractionMintKey,
    fractionTreasury: fractionTreasuryKey,
    fractionMintAuthority,
    vaultAuthority: wallet.publicKey,
  });
  instructions.push(activateVaultTx);

  const outstandingShareAccount = Keypair.generate();
  const outstandingShareAccountTx = new transactions.CreateTokenAccount(
    txOptions,
    {
      newAccountPubkey: outstandingShareAccount.publicKey,
      lamports: accountRent,
      mint: fractionMintKey,
      owner: wallet.publicKey,
    }
  );

  instructions.push(outstandingShareAccountTx);
  signers.push(outstandingShareAccount);

  const payingTokenAccount = Keypair.generate();
  const payingTokenAccountTx = new transactions.CreateTokenAccount(txOptions, {
    newAccountPubkey: payingTokenAccount.publicKey,
    lamports: accountRent,
    mint: priceMint,
    owner: wallet.publicKey,
  });
  instructions.push(payingTokenAccountTx);
  signers.push(payingTokenAccount);

  const transferAuthority = Keypair.generate();
  const createApproveTx = (account: any) =>
    new Transaction().add(
      Token.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        account.publicKey,
        transferAuthority.publicKey,
        wallet.publicKey,
        [],
        0
      )
    );

  instructions.push(createApproveTx(payingTokenAccount));
  instructions.push(createApproveTx(outstandingShareAccount));
  signers.push(transferAuthority);

  const combineVaultTx = new programs.vault.CombineVault(txOptions, {
    vault,
    outstandingShareTokenAccount: outstandingShareAccount.publicKey,
    payingTokenAccount: payingTokenAccount.publicKey,
    fractionMint: fractionMintKey,
    fractionTreasury: fractionTreasuryKey,
    redeemTreasury: redeemTreasuryKey,
    burnAuthority: fractionMintAuthority,
    externalPriceAccount: pricingLookupAddressKey,
    transferAuthority: transferAuthority.publicKey,
    vaultAuthority: wallet.publicKey,
    newVaultAuthority: wallet.publicKey,
  });
  instructions.push(combineVaultTx);

  return {
    instructions,
    signers,
  };
};

export const createAuctionInstruction = async ({
  wallet,
  vault,
  endAuctionAt,
  price,
  isInstantSale,
  secondsDuration,
}: any) => {
  let instructions: any = [],
    signers: any = [];
  const numberOfWinners = new BN(1);
  const winnerLimit = new WinnerLimit({
    type: WinnerLimitType.Capped,
    usize: numberOfWinners,
  });

  const auctionSettings: any = {
    instruction: 1,
    winners: winnerLimit,
    tickSize: null,
    auctionGap: null,
    endAuctionAt: isInstantSale ? null : secondsDuration,
    gapTickSizePercentage: null,
    tokenMint: NATIVE_MINT.toBase58(),
    priceFloor: getPriceFloor(price),
    resource: vault.toBase58(),
    authority: wallet.publicKey.toBase58(),
    instantSalePrice: isInstantSale ? price : null,
    name: null,
  };

  const [auctionKey, auctionExtended] = await Promise.all([
    programs.auction.Auction.getPDA(vault),
    programs.auction.AuctionExtended.getPDA(vault),
  ]);

  let tx = new programs.auction.CreateAuctionV2(
    { feePayer: wallet.publicKey },
    {
      auction: auctionKey,
      auctionExtended: auctionExtended,
      creator: wallet.publicKey,
      args: auctionSettings,
    }
  );

  instructions.push(tx);

  return {
    instructions,
    signers,
    auction: auctionKey,
    auctionExtended: auctionExtended,
  };
};

export const createAuctionManagerInstruction = async ({
  wallet,
  vault,
  store,
  auction,
}: any) => {
  const network = "devnet";
  let instructions = [],
    signers = [];
  const auctionManagerPDA = await programs.metaplex.AuctionManager.getPDA(
    toPublicKey(auction)
  );
  const newTokenTracker =
    await programs.metaplex.AuctionWinnerTokenTypeTracker.getPDA(
      auctionManagerPDA
    );
  const rentExempt = await new Connection(
    endpoint.url,
    "confirmed"
  ).getMinimumBalanceForRentExemption(AccountLayout.span);
  const createAccountTx = new Transaction({ feePayer: wallet.publicKey });
  const account = Keypair.generate();
  createAccountTx.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: account.publicKey,
      lamports: rentExempt,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  createAccountTx.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      account.publicKey,
      auctionManagerPDA
    )
  );

  //idk if this is necessary
  createAccountTx.feePayer = wallet.publicKey;

  instructions.push(createAccountTx);
  signers.push(account);

  const tx = new programs.metaplex.InitAuctionManagerV2(
    { feePayer: wallet.publicKey },
    {
      vault: toPublicKey(vault),
      auction: toPublicKey(auction),
      store: toPublicKey(store),
      auctionManager: auctionManagerPDA,
      auctionManagerAuthority: toPublicKey(wallet.publicKey),
      acceptPaymentAccount: account.publicKey,
      tokenTracker: newTokenTracker,
      amountType: programs.core.TupleNumericType.U8,
      lengthType: programs.core.TupleNumericType.U8,
      maxRanges: new BN(10),
    }
  );

  tx.feePayer = wallet.publicKey;
  instructions.push(tx);

  return {
    instructions,
    signers,
    auctionManager: auctionManagerPDA,
    tokenTracker: newTokenTracker,
    acceptPaymentAccount: account.publicKey,
  };
};

const createUpdateAuctionAuthority = ({
  wallet,
  auction,
  auctionManager,
  instructions,
}: any) => {
  let manualTransaction = new Transaction({
    feePayer: wallet.publicKey,
  });

  const data = Buffer.from(serialize(AUCTION_SCHEMA, new SetAuthorityArgs()));
  const keys = [
    {
      pubkey: auction,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: auctionManager,
      isSigner: false,
      isWritable: false,
    },
  ];
  manualTransaction.add(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(auctionProgramId),
      data: data,
    })
  );
  instructions.push(manualTransaction);
  return;
};

export const createUpdateVaultAuthority = ({
  wallet,
  vault,
  auctionManager,
  instructions,
}: any) => {
  let manualTransaction = new Transaction({
    feePayer: wallet.publicKey,
  });

  const data = Buffer.from([10]);
  const keys = [
    {
      pubkey: vault,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: auctionManager,
      isSigner: false,
      isWritable: false,
    },
  ];
  manualTransaction.add(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(vaultProgramId),
      data: data,
    })
  );

  instructions.push(manualTransaction);
  return;
};

export const updateVaultAndAuctionAuthority = async ({
  wallet,
  auction,
  vault,
  auctionManager,
}: any) => {
  let instructions: any = [],
    signers: any = [];

  createUpdateAuctionAuthority({
    wallet,
    auction,
    auctionManager,
    instructions,
  });
  createUpdateVaultAuthority({ wallet, vault, auctionManager, instructions });

  return {
    instructions,
    signers,
  };
};

export const validateAuctionInstruction = async ({
  wallet,
  vault,
  nft,
  store,
  metadata,
  tokenStore,
  tokenTracker,
}: any) => {
  const network = "devnet";
  const connection = new Connection(endpoint.url, "confirmed");
  const auctionPDA = await programs.auction.Auction.getPDA(vault);
  const auctionManagerPDA = await programs.metaplex.AuctionManager.getPDA(
    auctionPDA
  );
  const sdb = await programs.vault.SafetyDepositBox.getPDA(
    vault,
    toPublicKey(nft)
  );
  const whitelistedCreator = await programs.metaplex.WhitelistedCreator.getPDA(
    store,
    wallet.publicKey
  );
  const safetyDepositConfigKey =
    await programs.metaplex.SafetyDepositConfig.getPDA(auctionManagerPDA, sdb);
  const edition = await programs.metadata.Edition.getPDA(nft);
  const originalAuthority = await PublicKey.findProgramAddress(
    [Buffer.from("metaplex"), auctionPDA.toBuffer(), metadata.toBuffer()],
    toPublicKey(metaplexProgramId)
  );

  const safetyDepositConfigArgs = new SafetyDepositConfig({
    key: 9,
    auctionManager: SystemProgram.programId.toBase58(),
    order: new BN(0),
    winningConfigType: 1,
    amountType: programs.core.TupleNumericType.U8,
    lengthType: programs.core.TupleNumericType.U8,
    amountRanges: [new AmountRange({ amount: new BN(1), length: new BN(1) })],
    participationConfig: null,
    participationState: null,
  });

  const value = new ValidateSafetyDepositBoxV2Args(safetyDepositConfigArgs);
  // @ts-ignore
  const data = Buffer.from(serialize(SAFETY_DEPOSIT_BOX_SCHEMA, value));

  let manualTransaction = new Transaction({
    feePayer: wallet.publicKey,
  });

  const keys = [
    {
      pubkey: toPublicKey(safetyDepositConfigKey),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: tokenTracker,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionManagerPDA,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: metadata,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: originalAuthority[0],
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: whitelistedCreator,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: store,
      isSigner: false,
      isWritable: false,
    },
    {
      // chaning safetydepositbox here
      pubkey: sdb,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenStore,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: nft,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: edition,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: vault,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: false,
    },

    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(metadataProgramId),
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

  manualTransaction.add(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metaplexProgramId),
      data,
    })
  );
  return {
    instructions: [manualTransaction],
    signers: [],
  };
};

export const startAuctionInstruction = async ({
  wallet,
  store,
  auction,
  auctionManager,
}: any) => {
  const tx = new programs.metaplex.StartAuction(
    { feePayer: wallet.publicKey },
    {
      store: toPublicKey(store),
      auction: toPublicKey(auction),
      auctionManager: toPublicKey(auctionManager),
      auctionManagerAuthority: wallet.publicKey,
    }
  );
  // tx.feePayer = wallet.publicKey;
  return {
    signers: [],
    instructions: [tx],
  };
};

export const cancelBidInstraction = async ({
  connection,
  wallet,
  auction,
  bidderPotToken,
  destAccount,
}: any): Promise<any> => {
  let instructions = [],
    signers = [],
    afterInstructions = [];
  const bidder = wallet.publicKey;
  const auctionManager = await AuctionManager.getPDA(auction);
  const manager = await AuctionManager.load(connection, auctionManager);
  const {
    data: { tokenMint },
  } = await manager.getAuction(connection);

  const auctionTokenMint = new PublicKey(tokenMint);
  const vault = new PublicKey(manager.data.vault);
  const auctionExtended = await AuctionExtended.getPDA(vault);
  const bidderPot = await BidderPot.getPDA(auction, bidder);
  const bidderMeta = await BidderMetadata.getPDA(auction, bidder);

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );

  const auctionToken = new PublicKey(
    process.env.REACT_APP_CUSTOM_NATIVE_MINT || ""
  );
  if (auctionToken.toBase58() != WrappedSolMint.toBase58()) {
    const recieverAta = (
      await PublicKey.findProgramAddress(
        [
          bidder.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          auctionToken.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
    destAccount = recieverAta;
  } else {
    if (!destAccount) {
      // const account = Keypair.generate();
      // const createTokenAccountTransaction = new transactions.CreateTokenAccount(
      //   { feePayer: bidder },
      //   {
      //     newAccountPubkey: account.publicKey,
      //     lamports: accountRentExempt,
      //     mint: NATIVE_MINT,
      //   }
      // );
      // instructions.push(createTokenAccountTransaction);
      // signers.push(account);

      const recieverAta = (
        await PublicKey.findProgramAddress(
          [
            bidder.toBuffer(),
            splToken.TOKEN_PROGRAM_ID.toBuffer(),
            NATIVE_MINT.toBuffer(),
          ],
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )[0];
      const existingAta = await connection.getAccountInfo(recieverAta);
      if (!existingAta) {
        createAssociatedTokenAccountInstruction(
          instructions,
          recieverAta, //associated account address
          wallet.publicKey, //payer
          bidder, //receiver wallet address
          NATIVE_MINT
        );
      }
      destAccount = recieverAta;

      // destAccount = bidder;
    }
  }
  // signers.push(wallet);

  const cancelBidTransaction = new programs.auction.CancelBid(
    { feePayer: bidder },
    {
      bidder,
      bidderToken: destAccount,
      bidderPot,
      bidderPotToken,
      bidderMeta,
      auction,
      auctionExtended,
      tokenMint: auctionTokenMint,
      resource: vault,
    }
  );

  instructions.push(cancelBidTransaction);

  //closing account instruction
  if (auctionToken.toBase58() == WrappedSolMint.toBase58()) {
    let { instructions: closeAccInstruction, signers: closeAccSigner } =
      await closeAssociatedAccountInstruction({
        associatedAcc: destAccount,
        wallet: wallet,
      });
    instructions.push(closeAccInstruction[0]);
  }

  return {
    signers: [...signers],
    instructions: [...instructions],
  };
};

interface CancelBidTransactionsParams {
  destAccount?: PublicKey;
  bidder: PublicKey;
  accountRentExempt: number;
  bidderPot: PublicKey;
  bidderPotToken: PublicKey;
  bidderMeta: PublicKey;
  auction: PublicKey;
  auctionExtended: PublicKey;
  auctionTokenMint: PublicKey;
  vault: PublicKey;
}

// export const getCancelBidTransactions = async ({
//     destAccount,
//     bidder,
//     accountRentExempt,
//     bidderPot,
//     bidderPotToken,
//     bidderMeta,
//     auction,
//     auctionExtended,
//     auctionTokenMint,
//     vault,
// }: CancelBidTransactionsParams): Promise<TransactionsBatch> => {
//     const txBatch = new TransactionsBatch({ transactions: [] });
//     if (!destAccount) {
//         const account = Keypair.generate();
//         const createTokenAccountTransaction = new transactions.CreateTokenAccount(
//             { feePayer: bidder },
//             {
//                 newAccountPubkey: account.publicKey,
//                 lamports: accountRentExempt,
//                 mint: NATIVE_MINT,
//             },
//         );
//         const closeTokenAccountInstruction = new Transaction().add(
//             Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, account.publicKey, bidder, bidder, []),
//         );
//         txBatch.addTransaction(createTokenAccountTransaction);
//         txBatch.addAfterTransaction(closeTokenAccountInstruction);
//         txBatch.addSigner(account);
//         destAccount = account.publicKey;
//     }

//     const cancelBidTransaction = new programs.auction.CancelBid(
//         { feePayer: bidder },
//         {
//             bidder,
//             bidderToken: destAccount,
//             bidderPot,
//             bidderPotToken,
//             bidderMeta,
//             auction,
//             auctionExtended,
//             tokenMint: auctionTokenMint,
//             resource: vault,
//         },
//     );
//     txBatch.addTransaction(cancelBidTransaction);

//     return txBatch;
// };

export const placeBidInstruction = async ({
  connection,
  bidderWallet,
  amount,
  auction,
  taxFee,
  currentUser,
}: any) => {
  let instructions = [],
    signers = [],
    afterInstructions = [];

  const tempTransAmount = amount.toNumber() / LAMPORTS_PER_SOL;
  const taxAmount = taxFee.toNumber();
  const responsePayTax = await payTax({
    connection,
    wallet: bidderWallet,
    transactionAmount: taxFee.toNumber(),
    currentUser,
  });

  if (responsePayTax === -1) {
    return -1;
  }

  const { instructions: taxInstructions, signers: taxSigners }: any =
    responsePayTax;

  const bidder = bidderWallet.publicKey;
  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );
  const auctionManager = await programs.metaplex.AuctionManager.getPDA(auction);
  const manager = await programs.metaplex.AuctionManager.load(
    connection,
    auctionManager
  );
  const {
    data: { tokenMint },
  } = await manager.getAuction(connection);

  const auctionTokenMint = new PublicKey(tokenMint);
  const vault = new PublicKey(manager.data.vault);
  const auctionExtended = await programs.auction.AuctionExtended.getPDA(vault);
  const bidderPot = await programs.auction.BidderPot.getPDA(auction, bidder);
  const bidderMeta = await programs.auction.BidderMetadata.getPDA(
    auction,
    bidder
  );

  const bidderPotToken =
    await programs.auction.AuctionProgram.findProgramAddress([
      Buffer.from(programs.auction.AuctionProgram.PREFIX),
      bidderPot.toBuffer(),
      Buffer.from("bidder_pot_token"),
    ]);

  let payingAccount = null;
  if (NATIVE_MINT.toBase58() != WrappedSolMint.toBase58()) {
    payingAccount = new PublicKey(await findAta(tokenMint, bidder, connection));
  } else {
    const {
      account: payingAccountTemp,
      createTokenAccountTx,
      closeTokenAccountTx,
    } = await actions.createWrappedAccountTxs(
      connection,
      bidder,
      amount.toNumber() + accountRentExempt * 2
    );
    payingAccount = payingAccountTemp.publicKey;
    instructions.push(createTokenAccountTx);
    signers.push(payingAccountTemp);
    afterInstructions.push(closeTokenAccountTx);
  }

  const {
    authority: transferAuthority,
    createApproveTx,
    createRevokeTx,
  } = actions.createApproveTxs({
    account: payingAccount,
    owner: bidder,
    amount: amount.toNumber(),
  });
  instructions.push(createApproveTx);
  signers.push(transferAuthority);

  const placeBidTransaction = new programs.auction.PlaceBid(
    { feePayer: bidder },
    {
      bidder,
      bidderToken: payingAccount,
      bidderPot,
      bidderPotToken,
      bidderMeta,
      auction,
      auctionExtended,
      tokenMint: auctionTokenMint,
      transferAuthority: transferAuthority.publicKey,
      amount,
      resource: vault,
    }
  );
  instructions.push(placeBidTransaction);

  instructions.push(createRevokeTx);

  return {
    instructions: [...instructions, ...afterInstructions],
    signers: signers,
    taxInstructions,
    taxSigners,
    bidderPotToken,
    bidderMeta,
  };
};

export const getEndAuctionInstructions = async ({
  connection,
  auction,
  store,
  wallet,
}: any) => {
  const auctionManager = await programs.metaplex.AuctionManager.getPDA(auction);
  const auctionManagerLoaded = await programs.metaplex.AuctionManager.load(
    connection,
    auctionManager
  );
  let loadedAuc = await programs.auction.Auction.load(connection, auction);
  const manager = await programs.metaplex.AuctionManager.load(
    connection,
    auctionManager
  );
  const vault = await programs.vault.Vault.load(connection, manager.data.vault);
  const auctionExtended = await programs.auction.AuctionExtended.getPDA(
    vault.pubkey
  );
  const tx = new programs.metaplex.EndAuction(
    { feePayer: wallet.publicKey },
    {
      store: toPublicKey(store),
      auctionManager: toPublicKey(auctionManager),
      auctionManagerAuthority: toPublicKey(manager.data.authority),
      auction: toPublicKey(auction),
      auctionExtended,
    }
  );
  return {
    instructions: [tx],
    signers: [],
  };
};

const getRedeemFRTBidTransactions = async ({
  accountRentExempt,
  bidder,
  tokenMint,
  store,
  vault,
  auction,
  auctionManager,
  auctionExtended,
  bidRedemption,
  bidderMeta: bidMetadata,
  safetyDepositTokenStore,
  safetyDeposit,
  fractionMint,
  safetyDepositConfig,
  transferAuthority,
  metadata,
}: any) => {
  let instructions = [],
    signers = [];
  // create a new account for redeeming
  const account = Keypair.generate();
  const createDestinationTransaction = new transactions.CreateTokenAccount(
    { feePayer: bidder },
    {
      newAccountPubkey: account.publicKey,
      lamports: accountRentExempt,
      mint: tokenMint,
    }
  );
  signers.push(account);
  instructions.push(createDestinationTransaction);

  // create redeem bid
  const redeemBidTransaction =
    new programs.metaplex.RedeemFullRightsTransferBid(
      { feePayer: bidder },
      {
        store,
        vault,
        auction,
        auctionManager,
        bidRedemption,
        bidMetadata,
        safetyDepositTokenStore,
        destination: account.publicKey,
        safetyDeposit,
        fractionMint,
        bidder,
        safetyDepositConfig,
        auctionExtended,
        transferAuthority,
        newAuthority: bidder,
        masterMetadata: metadata,
      }
    );
  instructions.push(redeemBidTransaction);
  ////

  // update primary sale happened via token
  const updatePrimarySaleHappenedViaTokenTransaction =
    new programs.metadata.UpdatePrimarySaleHappenedViaToken(
      { feePayer: bidder },
      {
        metadata,
        owner: bidder,
        tokenAccount: account.publicKey,
      }
    );
  instructions.push(updatePrimarySaleHappenedViaTokenTransaction);
  ////

  return {
    instructions,
    signers,
    tokenAccount: account.publicKey,
  };
};

const getBidRedemptionPDA = async (auction: any, bidderMeta: any) => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(programs.metaplex.MetaplexProgram.PREFIX),
        auction.toBuffer(),
        bidderMeta.toBuffer(),
      ],
      programs.metaplex.MetaplexProgram.PUBKEY
    )
  )[0];
};

export const redeemNFTInstruction = async ({
  connection,
  bidderWallet,
  store,
  auction,
}: any) => {
  const bidder = bidderWallet.publicKey;
  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );
  const auctionManager = await programs.metaplex.AuctionManager.getPDA(auction);
  const manager = await programs.metaplex.AuctionManager.load(
    connection,
    auctionManager
  );
  const vault = await programs.vault.Vault.load(connection, manager.data.vault);
  const fractionMint = new PublicKey(vault.data.fractionMint);
  const auctionExtended = await programs.auction.AuctionExtended.getPDA(
    vault.pubkey
  );
  // assuming we have 1 item
  const [safetyDepositBox] = await vault.getSafetyDepositBoxes(connection);
  const tokenMint = toPublicKey(safetyDepositBox.data.tokenMint);
  const safetyDepositTokenStore = toPublicKey(safetyDepositBox.data.store);
  const bidderMeta = await programs.auction.BidderMetadata.getPDA(
    auction,
    bidder
  );
  const bidRedemption = await getBidRedemptionPDA(auction, bidderMeta);
  const safetyDepositConfig =
    await programs.metaplex.SafetyDepositConfig.getPDA(
      auctionManager,
      safetyDepositBox.pubkey
    );
  const transferAuthority = await programs.vault.Vault.getPDA(vault.pubkey);
  const metadata = await programs.metadata.Metadata.getPDA(tokenMint);
  ////

  const {
    instructions: redeemInstructions,
    signers: redeemSigners,
    tokenAccount,
  } = await getRedeemFRTBidTransactions({
    accountRentExempt,
    tokenMint,
    bidder,
    bidderMeta,
    store,
    vault: vault.pubkey,
    auction,
    auctionExtended,
    auctionManager,
    fractionMint,
    safetyDepositTokenStore,
    safetyDeposit: safetyDepositBox.pubkey,
    bidRedemption,
    safetyDepositConfig,
    transferAuthority,
    metadata,
  });
  return {
    instructions: redeemInstructions,
    signers: redeemSigners,
    tokenAccount,
  };
};

export const claimBidInstruction = async ({
  connection,
  wallet,
  store,
  auction,
  bidderPotToken,
}: any) => {
  let instructions: any = [],
    signers: any = [];
  // get data for transactions
  const bidder = wallet.publicKey;
  const auctionManager = await AuctionManager.getPDA(new PublicKey(auction));
  const manager = await AuctionManager.load(connection, auctionManager);
  const vault = new PublicKey(manager.data.vault);
  const {
    data: { tokenMint },
  } = await Auction.load(connection, auction);
  const acceptPayment = new PublicKey(manager.data.acceptPayment);
  const auctionExtended = await AuctionExtended.getPDA(vault);
  const auctionTokenMint = new PublicKey(tokenMint);
  const bidderPot = await BidderPot.getPDA(auction, bidder);
  ////

  const claimBidTransaction = new ClaimBid(
    { feePayer: bidder },
    {
      store: new PublicKey(store),
      vault,
      auction,
      auctionExtended,
      auctionManager,
      bidder,
      tokenMint: auctionTokenMint,
      acceptPayment,
      bidderPot,
      bidderPotToken,
    }
  );
  instructions.push(claimBidTransaction);

  return {
    instructions,
    signers,
  };
};

export const closeAssociatedAccountInstruction = async ({
  associatedAcc,
  wallet,
}: any) => {
  let instructions = [],
    signers = [];
  let instruction = Token.createCloseAccountInstruction(
    splToken.TOKEN_PROGRAM_ID,
    associatedAcc, //account to be closed
    wallet.publicKey, //remaining balance transfer
    wallet.publicKey, //authority/owner of closing account
    []
  );
  // const instructions = new web3.Transaction().add(instruction);
  instructions.push(instruction);
  // signers.push(owner);
  return { instructions, signers };
};

export const withdrawTokensFromVault = async ({
  connection,
  nft_key,
  vault,
  wallet,
  fractionMint,
  receiver,
}: any) => {
  let instructions: any = [],
    signers: any = [];

  const safetyDepositBoxTemp = await programs.vault.SafetyDepositBox.getPDA(
    vault,
    toPublicKey(nft_key)
  );
  const safetyDepositBox = await programs.vault.SafetyDepositBox.load(
    connection,
    safetyDepositBoxTemp
  );

  const transferAuthorityPDA = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("vault"),
        new PublicKey(vaultProgramId).toBuffer(),
        vault.toBuffer(),
      ],
      new PublicKey(vaultProgramId)
    )
  )[0];

  const ata = (
    await PublicKey.findProgramAddress(
      [
        receiver.toBuffer(),
        splToken.TOKEN_PROGRAM_ID.toBuffer(),
        new PublicKey(nft_key).toBuffer(),
      ],
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];

  const existingAta = await connection.getAccountInfo(toPublicKey(ata));
  if (!existingAta)
    createAssociatedTokenAccountInstruction(
      instructions,
      toPublicKey(ata),
      wallet.publicKey,
      receiver.publicKey,
      new PublicKey(nft_key)
    );

  let tx = new WithdrawTokenFromSafetyDepositBox(
    {
      feePayer: wallet.publicKey,
    },
    {
      vault,
      destination: ata,
      safetyDepositBox: safetyDepositBoxTemp,
      fractionMint: fractionMint,
      vaultAuthority: wallet.publicKey,
      transferAuthority: transferAuthorityPDA,
      amount: new BN(1),
      store: new PublicKey(safetyDepositBox.data.store),
    }
  );

  instructions.push(tx);
  signers.push(wallet.payer);

  return { instructions, signers };
};

export const payFractionalMintPrice = async ({
  connection,
  wallet,
  price,
  nft_owner,
  taxFee,
}: any) => {
  try {
    //tax
    const responsePayTax = await payTax({
      connection,
      wallet,
      transactionAmount: taxFee,
    });

    if (responsePayTax === -1) {
      return -1;
    }

    const { instructions: taxInstruction, signers: taxSigners }: any =
      responsePayTax;

    //payment
    let buyTransferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: nft_owner,
        lamports: price * LAMPORTS_PER_SOL,
      })
    );

    const buyInstruction: any = [buyTransferTransaction];
    const lookup = {
      payTax: {
        instructions: taxInstruction,
        signers: taxSigners,
      },
      buyFraction: {
        instructions: buyInstruction,
        signers: [],
      },
    };

    let signers = [lookup.payTax.signers, lookup.buyFraction.signers];
    let toRemoveSigners: any = [];
    let instructions = [
      lookup.payTax.instructions,
      lookup.buyFraction.instructions,
    ].filter((instr, i) => {
      if (instr.length > 0) {
        return true;
      } else {
        toRemoveSigners[i] = true;
        return false;
      }
    });
    const { isAllSuccess, txList }: any = await sendTransactionsSmart(
      connection,
      wallet,
      instructions,
      signers,
      "single"
    );

    if (!isAllSuccess) {
      return false;
    }

    return txList;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

const getReclaimFRTBidTransactions = async ({
  accountRentExempt,
  bidder,
  tokenMint,
  store,
  vault,
  auction,
  auctionManager,
  auctionExtended,
  bidRedemption,
  bidderMeta: bidMetadata,
  safetyDepositTokenStore,
  safetyDeposit,
  fractionMint,
  safetyDepositConfig,
  transferAuthority,
  metadata,
  auctioneerReclaimIndex,
  blockhash,
  lastValidBlockHeight,
}: any) => {
  let instructions = [],
    signers = [];
  // create a new account for redeeming
  const account = Keypair.generate();
  const createDestinationTransaction = new transactions.CreateTokenAccount(
    { feePayer: bidder },
    {
      newAccountPubkey: account.publicKey,
      lamports: accountRentExempt,
      mint: tokenMint,
    }
  );
  signers.push(account);
  instructions.push(createDestinationTransaction);

  // create redeem bid
  const redeemBidTransaction = new ReclaimFullRightsTransferBid(
    { feePayer: bidder, blockhash, lastValidBlockHeight },
    {
      store,
      vault,
      auction,
      auctionManager,
      bidRedemption,
      bidMetadata,
      safetyDepositTokenStore,
      destination: account.publicKey,
      safetyDeposit,
      fractionMint,
      bidder,
      safetyDepositConfig,
      auctionExtended,
      transferAuthority,
      newAuthority: bidder,
      masterMetadata: metadata,
      auctioneerReclaimIndex: 0,
    }
  );
  instructions.push(redeemBidTransaction);
  ////

  return {
    instructions,
    signers,
    tokenAccount: account.publicKey,
  };
};

export const reclaimNFTInstruction = async ({
  connection,
  bidderWallet,
  store,
  auction,
}: any) => {
  const bidder = bidderWallet.publicKey;
  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );
  const auctionManager = await programs.metaplex.AuctionManager.getPDA(auction);
  const manager = await programs.metaplex.AuctionManager.load(
    connection,
    auctionManager
  );
  const vault = await programs.vault.Vault.load(connection, manager.data.vault);
  const fractionMint = new PublicKey(vault.data.fractionMint);
  const auctionExtended = await programs.auction.AuctionExtended.getPDA(
    vault.pubkey
  );
  // assuming we have 1 item
  const [safetyDepositBox] = await vault.getSafetyDepositBoxes(connection);
  const tokenMint = toPublicKey(safetyDepositBox.data.tokenMint);
  const safetyDepositTokenStore = toPublicKey(safetyDepositBox.data.store);
  const bidderMeta = await programs.auction.BidderMetadata.getPDA(
    auction,
    bidder
  );
  const bidRedemption = await getBidRedemptionPDA(auction, bidderMeta);
  const safetyDepositConfig =
    await programs.metaplex.SafetyDepositConfig.getPDA(
      auctionManager,
      safetyDepositBox.pubkey
    );
  const transferAuthority = await programs.vault.Vault.getPDA(vault.pubkey);
  const metadata = await programs.metadata.Metadata.getPDA(tokenMint);

  const { blockHash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("finalized");

  ////

  const {
    instructions: redeemInstructions,
    signers: redeemSigners,
    tokenAccount,
  } = await getReclaimFRTBidTransactions({
    accountRentExempt,
    tokenMint,
    bidder,
    bidderMeta,
    store,
    vault: vault.pubkey,
    auction,
    auctionExtended,
    auctionManager,
    fractionMint,
    safetyDepositTokenStore,
    safetyDeposit: safetyDepositBox.pubkey,
    bidRedemption,
    safetyDepositConfig,
    transferAuthority,
    metadata,
    blockhash: blockHash,
    lastValidBlockHeight,
  });
  return {
    instructions: redeemInstructions,
    signers: redeemSigners,
    tokenAccount,
  };
};

class SetAuthorityArgs {
  instruction = 5;
}

const AUCTION_SCHEMA = new Map([
  [
    SetAuthorityArgs,
    {
      kind: "struct",
      fields: [["instruction", "u8"]],
    },
  ],
]);

class SafetyDepositConfig {
  key: any;
  auctionManager: any;
  order: any;
  winningConfigType: any;
  amountType: any;
  lengthType: any;
  amountRanges: any;
  participationConfig: any;
  participationState: any;
  constructor(args: any) {
    Object.assign(this, args);
  }
}

class ValidateSafetyDepositBoxV2Args {
  instruction = 18;
  safetyDepositConfig;
  constructor(safetyDeposit: any) {
    this.safetyDepositConfig = safetyDeposit;
  }
}

class AmountRange {
  amount;
  length;
  constructor(args: any) {
    this.amount = args.amount;
    this.length = args.length;
  }
}

class ParticipationConfigV2 {
  winnerConstraint = 0;
  nonWinningConstraint = 1;
  fixedPrice = new BN(0);
  constructor(args: any) {
    Object.assign(this, args);
  }
}

class ParticipationStateV2 {
  collectedToAcceptPayment = new BN(0);

  constructor(args: any) {
    Object.assign(this, args);
  }
}

//@ts-ignore
const SAFETY_DEPOSIT_BOX_SCHEMA = new Map([
  [
    SafetyDepositConfig,
    {
      kind: "struct",
      fields: [
        ["key", "u8"],
        ["auctionManager", "pubkeyAsString"],
        ["order", "u64"],
        ["winningConfigType", "u8"],
        ["amountType", "u8"],
        ["lengthType", "u8"],
        ["amountRanges", [AmountRange]],
        [
          "participationConfig",
          { kind: "option", type: ParticipationConfigV2 },
        ],
        ["participationState", { kind: "option", type: ParticipationStateV2 }],
      ],
    },
  ],
  [
    ValidateSafetyDepositBoxV2Args,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["safetyDepositConfig", SafetyDepositConfig],
      ],
    },
  ],
  [
    AmountRange,
    {
      kind: "struct",
      fields: [
        ["amount", "u64"],
        ["length", "u64"],
      ],
    },
  ],
]);
