import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  AccountLayout,
  MintLayout,
} from "@solana/spl-token";
import BN from "bn.js";
import { getSolanaBalance, getUserBalance } from "./getUserBalance";
import { createAssociatedTokenAccountInstruction } from "./emptyPaymentAccountTransaction";
import { useSelector } from "react-redux";

export const findAta = async (tokenMint: any, bidder: any, connection: any) => {
  let receivingSolAccountOrAta = "";
  // if alternative currency is set, go for it
  const auctionTokenMint = new PublicKey(tokenMint);
  const ata = (
    await PublicKey.findProgramAddress(
      [
        bidder.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        auctionTokenMint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];

  const existingAta = await connection.getAccountInfo(ata);
  if (!existingAta) {
    throw "error bidder did not have any account of auction type mint";
  }

  receivingSolAccountOrAta = ata.toBase58();

  return receivingSolAccountOrAta;
};

export function getTaxationAmount({ transactionAmount }: any) {
  let taxationAmount = 0;
  try {
    const taxation_rate: any = process.env.REACT_APP_PIQSOL_TAX_PERCENTAGE;

    taxationAmount = Number(transactionAmount * (taxation_rate / 100));
  } catch (err) {
    console.log(`error occured while calculating tax amount ${err}`);
  }
  return taxationAmount;
}

export async function getSenderAta(wallet: any) {
  const mint = new PublicKey(
    process.env.REACT_APP_CUSTOM_NATIVE_MINT_TAX_MINT || ""
  );

  const senderAta = (
    await PublicKey.findProgramAddress(
      [
        wallet?.publicKey?.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];

  return senderAta;
}

export async function payChatPayment({
  connection,
  wallet,
  transactionAmount,
}: any) {
  let instructions: any = [],
    signers: any = [];
  const decimals = Number(
    process.env.REACT_APP_CUSTOM_NATIVE_MINT_TAX_MINT_DECIMALS
  );
  const mint = new PublicKey(
    process.env.REACT_APP_CUSTOM_NATIVE_MINT_TAX_MINT || ""
  );

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
    const recieverAta = (
      await PublicKey.findProgramAddress(
        [reciever.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];

    const senderAta = await getSenderAta(wallet);

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

export async function payTax(
  { connection, wallet, transactionAmount }: any,
  currentUser: any = undefined
) {
  let instructions: any = [],
    signers: any = [];
  const decimals = Number(
    process.env.REACT_APP_CUSTOM_NATIVE_MINT_TAX_MINT_DECIMALS
  );
  const mint = new PublicKey(
    process.env.REACT_APP_CUSTOM_NATIVE_MINT_TAX_MINT || ""
  );

  if (currentUser) {
    const { userPiqsolBalance, userNativeBalance } = await getUserBalance(
      currentUser?.chainType,
      wallet
    );
    if (userNativeBalance === 0 || userPiqsolBalance < transactionAmount) {
      return -1;
    }
  }

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
      createAssociatedTokenAccountInstruction(
        instructions,
        senderAta,
        wallet?.publicKey,
        wallet?.publicKey,
        mint
      );
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
