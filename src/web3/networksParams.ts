export const networks = {
  binance: {
    mainnet: {
      chainId: "0x38",
      chainName: "Binance Mainnet",
      nativeCurrency: {
        name: "Binance",
        symbol: "BNB",
        decimals: 18,
      },
      rpcUrls: ["https://bsc-dataseed.binance.org/"],
      blockExplorerUrls: ["https://bscscan.com"],
    },
    testnet: {
      chainId: "0x61",
      chainName: "Binance Testnet",
      nativeCurrency: {
        name: "Binance",
        symbol: "BNB",
        decimals: 18,
      },
      rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
      blockExplorerUrls: ["https://testnet.bscscan.com"],
    },
  },
  polygon: {
    mainnet: {
      chainId: "0x89",
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"],
    },
    testnet: {
      chainId: "0x13881",
      chainName: "Polygon Testnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: [
        "https://polygon-mumbai.infura.io/v3/7a9d2a7b9c6f459ea3cddcd3a917c460",
      ], // https://rpc-mumbai.maticvigil.com/
      blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    },
  },
};
