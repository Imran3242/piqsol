// const anchor = require("@project-serum/anchor")
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { NodeWallet, actions, programs } from "@metaplex/js";
const borsh = require("borsh");
import {
  getTokenWallet,
  createAssociatedTokenAccountInstruction,
  getMetadata,
  createMetadataInstruction,
  getMasterEdition,
  createMasterEditionInstruction,
} from "./mintnftcandyutils";
import { METADATA_SCHEMA } from "../../utils/helpers/mintnftcandyschema";
import { Creator, DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import BN from "bn.js";

import {
  sendTransactions,
  sendTransactionsSmart,
} from "../../utils/helpers/auctionTransactionHelper";
import { payTax } from "../../utils/helpers/customTokenAuctionUtils";

const splToken = require("@solana/spl-token");

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

const mpl_token_metadata = require("@metaplex-foundation/mpl-token-metadata");

const mintNFTLocal = async (
  connection: any,
  wallet: any,
  uri: any,
  metadataContent: any
) => {
  const mintRent = await connection.getMinimumBalanceForRentExemption(
    splToken.MintLayout.span
  );
  const mint = Keypair.generate();
  const instructions = [];

  const signers = [mint];

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: mintRent,
      space: splToken.MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  instructions.push(
    splToken.Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      0,
      wallet.publicKey,
      wallet.publicKey
    )
  );

  const userTokenAccoutAddress = await getTokenWallet(
    wallet.publicKey,
    mint.publicKey
  );
  instructions.push(
    createAssociatedTokenAccountInstruction(
      userTokenAccoutAddress,
      wallet.publicKey,
      wallet.publicKey,
      mint.publicKey
    )
  );

  const dataV2Creators = metadataContent.properties.creators.map((obj) => {
    return new Creator({
      address: obj.address,
      verified: true,
      share: obj.share,
    });
  });
  const data = new DataV2({
    name: metadataContent.name,
    symbol: metadataContent.symbol,
    uri: uri,
    sellerFeeBasisPoints: metadataContent.seller_fee_basis_points,
    creators: dataV2Creators,
    collection: null,
    uses: null,
  });

  //creating metadata
  const metadataAccount = await getMetadata(mint.publicKey);
  let txnData = Buffer.from(
    borsh.serialize(
      new Map<any, any>([
        mpl_token_metadata.DataV2.SCHEMA,
        // @ts-ignore
        ...METADATA_SCHEMA,
        ...mpl_token_metadata.CreateMetadataV2Args.SCHEMA,
      ]),
      new mpl_token_metadata.CreateMetadataV2Args({ data, isMutable: true })
    )
  );

  instructions.push(
    createMetadataInstruction(
      metadataAccount,
      mint.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      txnData
    )
  );
  instructions.push(
    splToken.Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      userTokenAccoutAddress,
      wallet.publicKey,
      [],
      1
    )
  );

  //create master edition
  const editionAccount = await getMasterEdition(mint.publicKey);
  txnData = Buffer.from(
    borsh.serialize(
      new Map([
        mpl_token_metadata.DataV2.SCHEMA,
        // @ts-ignore
        ...METADATA_SCHEMA,
        ...mpl_token_metadata.CreateMasterEditionV3Args.SCHEMA,
      ]),
      new mpl_token_metadata.CreateMasterEditionV3Args({ maxSupply: new BN(0) })
    )
  );

  instructions.push(
    createMasterEditionInstruction(
      metadataAccount,
      editionAccount,
      mint.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      txnData
    )
  );

  const Obj = {
    mint: mint.publicKey,
    edition: editionAccount,
    metadata: metadataAccount,
    instructions,
    signers,
  };
  return Obj;
};

const mintNFT = async ({
  connection,
  wallet,
  uri,
  metadataContent,
  payTax: checkPayTax,
  taxPayValue,
}) => {
  let lookup: any = {};
  let instructions: any = [];
  let signers: any = [];

  if (checkPayTax) {
    const taxPay: any = await payTax({
      connection,
      wallet,
      transactionAmount: taxPayValue,
    });

    if (taxPay === -1) {
      return -1;
    }
    const { instructions: payTaxInstructions, signers: payTaxSigners } = taxPay;
    lookup["payTax"] = {
      instructions: payTaxInstructions,
      signers: payTaxSigners,
    };
    instructions.push(lookup.payTax.instructions);
    signers.push(lookup.payTax.signers);
  }

  const {
    mint,
    edition,
    metadata,
    instructions: mintInstructions,
    signers: mintSigners,
  } = await mintNFTLocal(connection, wallet, uri, metadataContent);
  lookup["mintNft"] = { instructions: mintInstructions, signers: mintSigners };
  instructions.push(lookup.mintNft.instructions);
  signers.push(lookup.mintNft.signers);

  let toRemoveSigners: any = [];
  instructions = instructions.filter((instr, i) => {
    if (instr.length > 0) {
      return true;
    } else {
      toRemoveSigners[i] = true;
      return false;
    }
  });

  const res = await sendTransactionsSmart(
    connection,
    wallet,
    instructions,
    signers,
    "single"
  );

  return { mint, edition, metadata, res };
};

export { mintNFT };
