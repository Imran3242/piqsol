const delay = (sec: any) => new Promise((res) => setTimeout(res, sec * 1000));
const DEFAULT_TIMEOUT = 15000;
import { Transaction } from "@solana/web3.js";
import { Connection } from "@metaplex/js";
import { endpoint } from "./getChainNetwork";

import { SmartInstructionSender } from "@holaplex/solana-web3-tools";

async function awaitTransactionSignatureConfirmation(
  txid: any,
  timeout: any,
  connection: any,
  commitment: any = "recent",
  queryStatus: any = false
) {
  let done = false;
  let status = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  status = await (async () => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;

      throw { timeout: true };
    }, timeout);
    try {
      return await new Promise((resolve, reject) => {
        subId = connection.onSignature(
          txid,
          (result: any, context: any) => {
            done = true;
            const nextStatus = {
              err: result.err,
              slot: context.slot,
              confirmations: 0,
            };
            if (result.err) {
              console.log("Rejected via websocket", result.err);
              reject(nextStatus);
            } else {
              console.log("Resolved via websocket", result);
              resolve(nextStatus);
            }
          },
          commitment
        );
      });
    } catch (e) {
      done = true;
      console.error("WS error in setup", txid, e);
    }
    while (!done && queryStatus) {
      try {
        const signatureStatuses = await connection.getSignatureStatuses([txid]);
        const nextStatus = signatureStatuses && signatureStatuses.value[0];
        if (!done) {
          if (!nextStatus) {
            console.log("REST null result for", txid, nextStatus);
          } else if (nextStatus.err) {
            console.log("REST error for", txid, nextStatus);
            done = true;
            throw nextStatus.err;
          } else if (!nextStatus.confirmations) {
            console.log("REST no confirmations for", txid, nextStatus);
          } else {
            console.log("REST confirmation for", txid, nextStatus);
            done = true;
            return nextStatus;
          }
        }
      } catch (e) {
        if (!done) {
          console.log("REST connection error: txid", txid, e);
        }
      }
      await delay(2);
    }
  })();

  //@ts-ignore
  if (connection._signatureSubscriptions[subId])
    connection.removeSignatureListener(subId);
  done = true;

  return status;
}

const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

async function simulateTransaction(
  connection: any,
  transaction: any,
  commitment: any
) {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching
  );

  const signData = transaction.serializeMessage();
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString("base64");
  const config = { encoding: "base64", commitment };
  const args = [encodedTransaction, config];

  // @ts-ignore
  const res = await connection._rpcRequest("simulateTransaction", args);
  if (res.error) {
    throw new Error("failed to simulate transaction: " + res.error.message);
  }
  return res.result;
}

async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = DEFAULT_TIMEOUT,
}: any) {
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();
  let slot = 0;
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
  });

  console.log("Started awaiting confirmation for", txid);

  let done = false;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await delay(0.5);
    }
  })();
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      "recent",
      true
    );

    if (!confirmation)
      throw new Error("Timed out awaiting confirmation on transaction");

    if (confirmation.err) {
      console.error(confirmation.err);
      throw new Error("Transaction failed: Custom instruction error");
    }

    slot = confirmation?.slot || 0;
  } catch (err: any) {
    console.error("Timeout Error caught", err);
    if (err.timeout) {
      throw new Error("Timed out awaiting confirmation on transaction");
    }
    let simulateResult = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, "single")
      ).value;
      // eslint-disable-next-line no-empty
    } catch (e) {}
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];
          if (line.startsWith("Program log: ")) {
            throw new Error(
              "Transaction failed: " + line.slice("Program log: ".length)
            );
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.err));
    }
    // throw new Error('Transaction failed');
  } finally {
    done = true;
  }

  return { txid, slot };
}

export const sendTransactionsSmart = async (
  connection: any,
  wallet: any,
  instructions: any,
  signers: any,
  commitment: any
) => {
  let isAllSuccess = true;
  const txList = [];
  const sender = SmartInstructionSender.build(wallet, connection)
    .config({
      maxSigningAttempts: 5,
      abortOnFailure: true,
      commitment: "confirmed",
    })
    .withInstructionSets(
      instructions.map((ixs: any, i: any) => ({
        instructions: ixs,
        signers: signers[i],
      }))
    )
    .onProgress((i, txid) => {
      console.log(`Just sent, idx: ${i} txid: ${txid}`);
      txList.push(txid);
    })
    .onFailure((err) => {
      isAllSuccess = false;
      console.error(`Error: ${err}`);
    })
    .onReSign((attempt, i) => {
      console.warn(`ReSigning: ${i} attempt: ${attempt}`);
    });
  await sender.send();
  return { isAllSuccess, txList };
};

export const sendTransactions = async (
  connection: any,
  wallet: any,
  instructionSet: any,
  signersSet: any,
  commitment: any
): Promise<any> => {
  let unsignedTxns = [];
  let block = await connection.getRecentBlockhash(commitment);
  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i];
    const signers = signersSet[i];

    if (instructions.length === 0) {
      continue;
    }

    const transaction = new Transaction();
    instructions.forEach((instruction: any) => {
      transaction.add(instruction);
    });
    transaction.recentBlockhash = block.blockhash;

    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s: any) => s.publicKey)
    );

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    unsignedTxns.push(transaction);
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns);

  const breakEarlyObject = { breakEarly: false, i: 0 };
  const sentTransactionnId: any = [];
  let connction = new Connection(endpoint.url, "confirmed");
  for (let i = 0; i < signedTxns.length; i++) {
    connction = new Connection(endpoint.url, "confirmed");
    const signedTxnPromise = sendSignedTransaction({
      connection: connction,
      signedTransaction: signedTxns[i],
    });
    signedTxnPromise
      .then(({ txid }) => {
        console.log("Success tx num", i, txid);
        sentTransactionnId.push(txid);
      })
      .catch(() => {
        breakEarlyObject.breakEarly = true;
        breakEarlyObject.i = i;
      });
    try {
      await signedTxnPromise;

      await delay(2);
    } catch (e) {
      console.log("Failure at txn", i);
      console.log("Error received", e);
      if (breakEarlyObject.breakEarly) {
        console.log("Died on ", breakEarlyObject.i);
        return breakEarlyObject.i; // Return the txn we failed on by index
      }
      throw e;
    }
  }

  return sentTransactionnId;
};
