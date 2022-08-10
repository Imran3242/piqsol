// import { clusterApiUrl } from "@solana/web3.js";
import { ENV as ChainId } from "@solana/spl-token-registry";
const solanaNetwork: any = process.env.REACT_APP_NETWORK;


const endpoints = {
  http: {
    devnet: 'http://api.devnet.solana.com',
    testnet: 'http://api.testnet.solana.com',
    'mainnet-beta': 'http://api.metaplex.solana.com',
  },
  https: {
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
    'mainnet-beta': 'https://api.metaplex.solana.com',
  },
};

export type Cluster = 'devnet' | 'testnet' | 'mainnet-beta';

/**
 * Retrieves the RPC API URL for the specified cluster
 */
export function clusterApiUrl(cluster?: Cluster, tls?: boolean): string {
  const key = tls === false ? 'http' : 'https';

  if (!cluster) {
    return endpoints[key]['devnet'];
  }

  const url = endpoints[key][cluster];
  if (!url) {
    throw new Error(`Unknown ${key} cluster: ${cluster}`);
  }
  return url;
}


export const endpoint = {
  name: solanaNetwork,
  label: solanaNetwork,
  url: clusterApiUrl(solanaNetwork),
  chainId: ChainId.Devnet,
};
