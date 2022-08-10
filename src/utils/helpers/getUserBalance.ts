import { Connection } from "@metaplex/js";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getSenderAta } from "./customTokenAuctionUtils";
import { endpoint } from "./getChainNetwork";
import { NATIVE_MINT } from "@solana/spl-token";
import { getWeb3 } from "web3/web3";
import { getPQLBalance } from "web3/contractHelpers";

const currUsedTaxToken = new PublicKey(
  process.env.REACT_APP_CUSTOM_NATIVE_MINT_TAX_MINT || ""
);

const getSolanaBalance = async (wallet: any) => {
  try {
    const connection: Connection = new Connection(endpoint.url);
    const balance =
      (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL;
    return balance;
  } catch (err) {
    console.log("Error in getting SolBalance");
    return err;
  }
};

const getUserBalance = async (blockchainType: string, wallet: any) => {
  const balances = {
    userPiqsolBalance: 0,
    userNativeBalance: 0,
  };

  if (blockchainType?.toLowerCase() !== "solana") {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const pqlBalance = await getPQLBalance(web3, accounts);

    const nativeBalanceWei = await web3.eth.getBalance(accounts[0]);
    const nativeBalance = await web3.utils.fromWei(nativeBalanceWei, "ether");
    // TODO: GetUser PQL balance For Chain
    balances.userPiqsolBalance = pqlBalance;
    balances.userNativeBalance = parseFloat(nativeBalance);

    return balances;
  }

  const connection: Connection = new Connection(endpoint.url);

  const solbalance =
    (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL;
  balances.userNativeBalance = solbalance;
  if (NATIVE_MINT.toBase58() !== currUsedTaxToken.toBase58()) {
    const accountAta = await getSenderAta(wallet);
    const ifAtaExist = await connection.getAccountInfo(accountAta);
    if (ifAtaExist) {
      const piqSolbalance = await connection.getTokenAccountBalance(accountAta);
      balances.userPiqsolBalance =
        Number(piqSolbalance.value.amount) / LAMPORTS_PER_SOL;
    }
  }

  return balances;
};

export { getUserBalance, getSolanaBalance };
