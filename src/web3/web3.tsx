import {
  getUserNonceByWalletAddress,
  updateSignedNonceByWalletAddress,
} from "../store/reducers/userReducer";
import Web3 from "web3";
import { networks } from "./networksParams";

interface NativeCurrencyInterface {
  name: string;
  symbol: string;
  decimals: number;
}

interface NetworkParamsInterface {
  chainId: string;
  chainName: string;
  nativeCurrency: NativeCurrencyInterface;
  rpcUrls: Array<string>;
  blockExplorerUrls: Array<string>;
}

const isMetaMaskAvailable = (): boolean => {
  if (typeof (window as any).ethereum !== "undefined") {
    return true;
  }
  return false;
};

const getWeb3 = async () => {
  if (isMetaMaskAvailable()) {
    return new Web3((window as any).ethereum);
  }
};

const getChainId = async () => {
  return parseInt(
    await (window as any).ethereum.request({ method: "eth_chainId" })
  );
};

const addMultichainNetwork = async (networkParams: NetworkParamsInterface) => {
  try {
    await (window as any).ethereum.request({
      method: "wallet_addEthereumChain",
      params: [networkParams],
    });
  } catch (err) {
    console.log("🚀 ~ file: config.tsx ~ line 37 ~ err", err);
  }
};

const addingChainNetworkIfNotExsists = async (
  chainId: string,
  networkParams: NetworkParamsInterface
) => {
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
    return true;
  } catch (err) {
    if (err.code === 4902) {
      try {
        await addMultichainNetwork(networkParams);
        return true;
      } catch (err) {
        return false;
      }
    }
  }
};

const checkForMetamaskNetwork = async (selectedBlockChainType: string) => {
  if (!isMetaMaskAvailable()) return false;
  const chainId = await getChainId();

  if (selectedBlockChainType === "binance") {
    if (process.env.REACT_APP_NETWORK != "devnet" && chainId !== 56) {
      return addingChainNetworkIfNotExsists("0x38", networks.binance.mainnet);
    }

    if (process.env.REACT_APP_NETWORK === "devnet" && chainId !== 97) {
      return addingChainNetworkIfNotExsists("0x61", networks.binance.testnet);
    }
    return true;
  }

  if (process.env.REACT_APP_NETWORK != "devnet" && chainId !== 137) {
    return addingChainNetworkIfNotExsists("0x89", networks.polygon.mainnet);
  }

  if (process.env.REACT_APP_NETWORK === "devnet" && chainId !== 80001) {
    return addingChainNetworkIfNotExsists("0x13881", networks.polygon.testnet);
  }
  return true;
};

const getAccounts = async () => {
  const accounts = await (window as any).ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts;
};

const getAccountBalance = async (
  walletAddress: any,
  selectedBlockChainType: string
) => {
  const web3 = await getWeb3();
  return web3.utils.fromWei(await web3.eth.getBalance(walletAddress));
};

const getAccountInformation = async (
  selectedBlockChainType: string,
  walletAddress?: string
) => {
  try {
    const accounts = await getAccounts();
    const balance = await getAccountBalance(
      walletAddress || accounts[0],
      selectedBlockChainType
    );
    return { accounts, balance };
  } catch (err) {
    console.log(
      "🚀 ~ file: config.tsx ~ line 104 ~ getAccountInformation ~ err",
      err
    );
  }
};
const connect = async (selectedBlockChainType: string) => {
  const data = await getAccountInformation(selectedBlockChainType);
  const wallet = {
    accounts: data.accounts,
    primaryAccount: data.accounts[0],
    balance: data.balance,
  };
  return wallet;
};

const getNonceString = async (
  walletAddress: string,
  selectedBlockChainType
) => {
  try {
    const res = await getUserNonceByWalletAddress(
      walletAddress,
      selectedBlockChainType
    );
    console.log("res =====", res);

    return {
      nonceString: `I am signing my one-time nonce for Piqsol: ${res?.data?.nonce}`,
      nonceValue: res?.data?.nonce,
    };
  } catch (err) {
    console.log("🚀 ~ file: config.tsx ~ line 143 ~ getNonceString ~ err", err);
  }
};

const getUserNonceForMetaMask = async (
  walletAddress: string,
  selectedBlockChainType: string
) => {
  try {
    const nonceMessageWithNonce: any = await getNonceString(
      walletAddress,
      selectedBlockChainType
    );
    if (nonceMessageWithNonce === true) return true;
    const web3 = await getWeb3();
    const signature = await web3.eth.personal.sign(
      web3.utils.fromUtf8(nonceMessageWithNonce?.nonceString),
      walletAddress,
      "One time nonce"
    );

    return { signature, nonce: nonceMessageWithNonce?.nonceValue };
  } catch (err) {
    console.log(
      "🚀 ~ file: config.tsx ~ line 150 ~ getUserNonceForMetaMask ~ err",
      err
    );
  }
};

const loginWithMetaMask = async (selectedBlockChainType: string) => {
  try {
    const walletInformation = await connect(selectedBlockChainType);
    const networkResponse = await checkForMetamaskNetwork(
      selectedBlockChainType
    );
    if (!networkResponse) {
      return -1;
    }

    const nonceSign: any = await getUserNonceForMetaMask(
      walletInformation.primaryAccount,
      selectedBlockChainType
    );

    return {
      walletAddress: walletInformation?.primaryAccount,
      nonce: nonceSign?.nonce,
      signature: nonceSign.signature,
    };
  } catch (err) {
    console.log(
      "🚀 ~ file: config.tsx ~ line 138 ~ loginWithMetaMask ~ err",
      err
    );
  }
};

export {
  getWeb3,
  isMetaMaskAvailable,
  checkForMetamaskNetwork,
  getAccountInformation,
  connect,
  getNonceString,
  loginWithMetaMask,
};
