import { Connection } from "@metaplex/js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { sendTransactionsSmart } from "./auctionTransactionHelper";
import { getSenderAta } from "./customTokenAuctionUtils";
import { endpoint } from "./getChainNetwork";

export async function payTax({ connection, wallet, transactionAmount }: any) {
  let instructions: any = [],
    signers: any = [];
  const decimals = Number(
    process.env.REACT_APP_CUSTOM_NATIVE_MINT_TAX_MINT_DECIMALS
  );
  const mint = NATIVE_MINT;

  const reciever = new PublicKey(
    process.env.REACT_APP_PIQSOL_TAX_PAYMENT_ACC || ""
  );
  let senderAta = wallet.publicKey;
  let recieverAta = reciever;

  let tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderAta,
      toPubkey: recieverAta,
      lamports: transactionAmount * LAMPORTS_PER_SOL,
    })
  );

  if (NATIVE_MINT.toBase58() != mint.toBase58()) {
    recieverAta = (
      await PublicKey.findProgramAddress(
        [reciever.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];

    senderAta = await getSenderAta(wallet);

    const existingReceiverAta = await connection.getAccountInfo(recieverAta);
    const existingSenderAta = await connection.getAccountInfo(senderAta);

    if (!existingReceiverAta || !existingSenderAta) {
      throw "Associated account missing in one of accs";
    }
    tx = new Transaction().add(
      Token.createTransferCheckedInstruction(
        TOKEN_PROGRAM_ID,
        senderAta, // token account
        mint, // mint
        recieverAta, // token account
        wallet.publicKey, // owner of token account
        [],
        Number(`${transactionAmount}e${decimals}`), // amount, if your deciamls is 8, 10^8 for 1 token
        decimals // decimals,
      )
    );
  }

  instructions.push(tx);

  return { instructions, signers };
}

export const solTransferToAdminWallet = async (
  wallet: any,
  solValue: number
) => {
  try {
    if (!wallet.publicKey) {
      return { isAllSuccess: false };
    }

    const connection: Connection = new Connection(endpoint.url);
    // const blockHash = (await connection.getRecentBlockhash("finalized"))
    //   .blockhash;
    // const adminWalletPubKey = new PublicKey(
    //   process.env.REACT_APP_ADMIN_WALLET_ADDRESS
    // );
    // const transactionInstruction = SystemProgram.transfer({
    //   fromPubkey: userWhoGetsPiqSolToken,
    //   toPubkey: adminWalletPubKey,
    //   lamports: solValue * LAMPORTS_PER_SOL,
    // });

    // const transaction = new Transaction({
    //   recentBlockhash: blockHash,
    //   feePayer: userWhoGetsPiqSolToken,
    // }).add(transactionInstruction);

    // const signature = await sendTransaction(transaction);
    const { instructions: taxInstructions, signers: taxSigners } = await payTax(
      {
        connection,
        wallet,
        transactionAmount: solValue,
      }
    );

    let lookup = {
      taxPayment: {
        instructions: taxInstructions,
        signers: taxSigners,
      },
    };

    let signers = [lookup.taxPayment.signers];
    let toRemoveSigners: any = [];
    let instructions = [lookup.taxPayment.instructions].filter((instr, i) => {
      if (instr.length > 0) {
        return true;
      } else {
        toRemoveSigners[i] = true;
        return false;
      }
    });
    let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);
    const { isAllSuccess, txList }: any = await sendTransactionsSmart(
      connection,
      wallet,
      instructions,
      filteredSigners,
      "single"
    );

    // const res = await connection.confirmTransaction(signature, "finalized");

    return { isAllSuccess, signature: txList[0] };
  } catch (err) {
    return { isAllSuccess: false };
  }
};
