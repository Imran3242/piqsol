import {
  actions,
  Connection,
  NodeWallet,
  programs,
  Wallet,
} from "@metaplex/js";

import {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

import {
  createExternalPriceTransaction,
  createVaultTransaction,
  createAddNftToVaultInstruction,
  createCloseVaultInstruction,
  createUpdateVaultAuthority,
  withdrawTokensFromVault,
} from "../../utils/helpers/auctionWithInstructionUtils";
import {
  sendTransactions,
  sendTransactionsSmart,
} from "../../utils/helpers/auctionTransactionHelper";
import { payTax } from "./customTokenAuctionUtils";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const createVaultAddNFT = async ({
  connection,
  wallet,
  nft_key,
  new_auth,
  mintPiqsolFee,
}: any) => {
  const responsePayTax = await payTax({
    connection,
    wallet,
    transactionAmount: mintPiqsolFee,
  });

  if (responsePayTax === -1) {
    return -1;
  }

  const { instructions: taxInstructions, signers: taxSigners }: any =
    responsePayTax;

  // creating external price transaction
  let {
    externalPriceAccount,
    priceMint,
    signers: epaSigners,
    instructions: epaInstructions,
  } = await createExternalPriceTransaction({ connection, wallet });

  let {
    vault,
    fractionMint,
    redeemTreasury,
    fractionTreasury,
    instructions: createVaultInstructions,
    signers: createVaultSigners,
  } = await createVaultTransaction({
    connection,
    externalPriceAccount,
    wallet,
  });

  let {
    instructions: addToVaultInstructions,
    signers: addToVaultSigners,
    tokenStoreAccount: tokenStoreAccount,
  } = await createAddNftToVaultInstruction({ vault, nftKey: nft_key, wallet });

  let { instructions: closeVaultInstructions, signers: closeVaultSigners } =
    await createCloseVaultInstruction({
      vault,
      wallet,
      fractionMint,
      fractionTreasury,
      redeemTreasury,
      pricingLookupAddress: externalPriceAccount,
    });

  let updateVaultAndAuctionAuthorityInstruction: any = [];
  let updateVaultAndAuctionAuthoritySigners: any = [];
  await createUpdateVaultAuthority({
    wallet,
    vault,
    auctionManager: new_auth,
    instructions: updateVaultAndAuctionAuthorityInstruction,
  });

  let lookup = {
    taxPayment: {
      instructions: taxInstructions,
      signers: taxSigners,
    },
    externalPriceAccount: {
      instructions: epaInstructions,
      signers: epaSigners,
    },
    createVault: {
      instructions: createVaultInstructions,
      signers: createVaultSigners,
    },
    addTokens: {
      instructions: addToVaultInstructions,
      signers: addToVaultSigners,
    },
    closeVault: {
      instructions: closeVaultInstructions,
      signers: closeVaultSigners,
    },
    updateVault: {
      instructions: updateVaultAndAuctionAuthorityInstruction,
      signers: updateVaultAndAuctionAuthoritySigners,
    },
  };

  let signers = [
    lookup.taxPayment.signers,
    lookup.externalPriceAccount.signers,
    lookup.createVault.signers,
    lookup.addTokens.signers,
    lookup.closeVault.signers,
    lookup.updateVault.signers,
  ];

  let toRemoveSigners: any = [];
  let instructions = [
    lookup.taxPayment.instructions,
    lookup.externalPriceAccount.instructions,
    lookup.createVault.instructions,
    lookup.addTokens.instructions,
    lookup.closeVault.instructions,
    lookup.updateVault.instructions,
  ].filter((instr, i) => {
    if (instr.length > 0) {
      return true;
    } else {
      toRemoveSigners[i] = true;
      return false;
    }
  });

  let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
  const response = await sendTransactionsSmart(
    connection,
    wallet,
    instructions,
    filteredSigners,
    "single"
  );

  return { response, vault, fractionMint };
};

const withdrawTokensFromVaultTrans = async ({
  connection,
  nft_key,
  vault,
  curr_auth,
  fractionMint,
  receiver,
}) => {
  try {
    // sleep for 5 secs
    await sleep(10000);
    let { instructions: withdrawInstructions, signers: withdrawSigners } =
      await withdrawTokensFromVault({
        connection,
        nft_key,
        vault,
        wallet: curr_auth,
        fractionMint,
        receiver,
      });
    await sendTransactions(
      connection,
      curr_auth,
      [withdrawInstructions],
      [withdrawSigners],
      "single"
    );
    return true;
  } catch (err) {
    console.log("error occured in withdrawing:", err);
    return false;
  }
};

export { createVaultAddNFT, withdrawTokensFromVaultTrans };
