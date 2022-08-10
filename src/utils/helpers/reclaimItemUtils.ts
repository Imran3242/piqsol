/**
 * NOTE: that we ignore @typescript-eslint/no-explicit-any cases in this file.
 * The way to fix this properly is to improve the return type of the
 * @metaplex-foundation/core `struct` and update that library.
 * Given that these parts of the SDK will be re-generated with solita very soon
 * that would be a wasted effort and therefore we make an EXCEPTION here.
 */
import { strict as assert } from "assert";
import { Borsh, Transaction } from "@metaplex-foundation/mpl-core";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionBlockhashCtor,
  TransactionInstruction,
} from "@solana/web3.js";
import { MetadataProgram } from "@metaplex-foundation/mpl-token-metadata";
import { config } from "@metaplex-foundation/mpl-core";

export class RedeemFullRightsTransferBidArgs extends Borsh.Data {
  static readonly SCHEMA: Map<any, any> =
    RedeemFullRightsTransferBidArgs.struct([["instruction", "u8"]]);

  instruction = 3;
}

type RedeemFullRightsTransferBidParams = {
  vault: PublicKey;
  auction: PublicKey;
  auctionManager: PublicKey;
  bidRedemption: PublicKey;
  bidMetadata: PublicKey;
  safetyDepositTokenStore: PublicKey;
  destination: PublicKey;
  safetyDeposit: PublicKey;
  fractionMint: PublicKey;
  bidder: PublicKey;
  safetyDepositConfig: PublicKey;
  auctionExtended: PublicKey;
  transferAuthority: PublicKey;
  masterMetadata: PublicKey;
  newAuthority: PublicKey;
  auctioneerReclaimIndex: number;
};

export class ReclaimFullRightsTransferBid extends Transaction {
  constructor(
    options: TransactionBlockhashCtor,
    params: ParamsWithStore<RedeemFullRightsTransferBidParams>
  ) {
    super(options);
    const { feePayer } = options;
    assert(feePayer != null, "need to provide feePayer account");

    const {
      store,
      vault,
      auction,
      auctionExtended,
      auctionManager,
      bidRedemption,
      bidMetadata,
      safetyDepositTokenStore,
      destination,
      safetyDeposit,
      fractionMint,
      bidder,
      safetyDepositConfig,
      transferAuthority,
      masterMetadata,
      newAuthority,
      auctioneerReclaimIndex,
    } = params;

    const data = RedeemUnusedWinningConfigItemsAsAuctioneerArgs.serialize();

    this.add(
      new TransactionInstruction({
        keys: [
          {
            pubkey: auctionManager,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: safetyDepositTokenStore,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: destination,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: bidRedemption,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: safetyDeposit,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: vault,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: fractionMint,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: auction,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: bidMetadata,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: bidder,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: feePayer,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: VaultProgram.PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: MetadataProgram.PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: store,
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
            pubkey: masterMetadata,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: newAuthority,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: transferAuthority,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: safetyDepositConfig,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: auctionExtended,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: new PublicKey(config.programs.metaplex),
        data,
      })
    );
  }
}

export enum ProxyCallAddress {
  RedeemBid = 0,
  RedeemFullRightsTransferBid = 1,
}

export class RedeemUnusedWinningConfigItemsAsAuctioneerArgs extends Borsh.Data<{
  winningConfigItemIndex: number;
  proxyCall: number;
}> {
  static readonly SCHEMA: Map<any, any> =
    RedeemUnusedWinningConfigItemsAsAuctioneerArgs.struct([
      ["instruction", "u8"],
      ["winningConfigItemIndex", "u8"],
      ["proxyCall", "u8"],
    ]);

  instruction = 12;
  winningConfigItemIndex?: number = 0;
  proxyCall?: number = 1;
}

export const VaultProgram = {
  PUBKEY: new PublicKey(config.programs.vault),
};

export type ParamsWithStore<P> = P & { store: PublicKey };
