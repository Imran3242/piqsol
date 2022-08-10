import MarketplaceContractABI from "../contracts/MarketplaceContractABI.json";
import MintingContractABI from "../contracts/MintingContractABI.json";
import PQLDexContractABI from "../contracts/PQLDexContractABI.json";
import PQLTokenContractABI from "../contracts/PQLTokenContractABI.json";
import StackingContractABI from "../contracts/StackingContractABI.json";
import MintingContractBinanceABI from "../contracts/MintingContractBinanceABI.json";
import MarketplceContractBinanceABI from "../contracts/MarketplaceContractBinanceABI.json";
import CommonContractABI from "../contracts/CommonMintingContract.json";

export const MINTING_CONTRACTS_DETAILS = {
  80001: {
    address: process.env.REACT_APP_POLYGON_MINTING_CONTRACT_ADDRESS, //  Polygon Testnet contract address
    contractABI: MintingContractABI,
  },

  137: {
    address: process.env.REACT_APP_POLYGON_MINTING_CONTRACT_ADDRESS, //  Polygon MAINNET contract address
    contractABI: MintingContractABI,
  },

  97: {
    address: process.env.REACT_APP_BINANCE_MINTING_CONTRACT_ADDRESS, // Binance Testnet Contract Address
    contractABI: MintingContractBinanceABI,
  },

  56: {
    address: process.env.REACT_APP_BINANCE_MINTING_CONTRACT_ADDRESS, // Binance MAINNET Contract Address
    contractABI: MintingContractBinanceABI,
  },
};

export const MARKETPLACE_CONTRACT_ADDRESS = {
  80001: {
    address: process.env.REACT_APP_POLYGON_MARKETPLACE_CONTRACT_ADDRESS, //  Polygon Testnet contract address
    contractABI: MarketplaceContractABI,
  },

  137: {
    address: process.env.REACT_APP_POLYGON_MARKETPLACE_CONTRACT_ADDRESS, //  Polygon MAINNET contract address
    contractABI: MarketplaceContractABI,
  },

  97: {
    address: process.env.REACT_APP_BINANCE_MARKETPLACE_CONTRACT_ADDRESS, // Binance Testnet Contract Address
    contractABI: MarketplceContractBinanceABI,
  },

  56: {
    address: process.env.REACT_APP_BINANCE_MARKETPLACE_CONTRACT_ADDRESS, // Binance MAINNET Contract Address
    contractABI: MarketplceContractBinanceABI,
  },
};

export const PQL_TOKEN_CONTRACT_ADDRESS = {
  80001: {
    address: process.env.REACT_APP_POLYGON_PQL_TOKEN, //  Polygon PQL-Token Testnet contract address
    contractABI: PQLTokenContractABI,
  },

  137: {
    address: process.env.REACT_APP_POLYGON_PQL_TOKEN, //  Polygon PQL-Token MAINNET contract address
    contractABI: PQLTokenContractABI,
  },

  97: {
    address: process.env.REACT_APP_BINANCE_PQL_TOKEN, // Binance PQL-Token Testnet Contract Address
    contractABI: PQLTokenContractABI,
  },

  56: {
    address: process.env.REACT_APP_BINANCE_PQL_TOKEN, // Binance PQL-Token MAINNET Contract Address
    contractABI: PQLTokenContractABI,
  },
};

export const PQL_DEX_CONTRACT_ADDRESS = {
  80001: {
    address: process.env.REACT_APP_POLYGON_PQL_DEX_ADDRESS, //  Polygon Dex Testnet contract address
    contractABI: PQLDexContractABI,
  },

  137: {
    address: process.env.REACT_APP_POLYGON_PQL_DEX_ADDRESS, //  Polygon Dex MAINNET contract address
    contractABI: PQLDexContractABI,
  },

  97: {
    address: process.env.REACT_APP_BINANCE_PQL_DEX_ADDRESS, // Binance Dex Testnet Contract Address
    contractABI: PQLDexContractABI,
  },
  56: {
    address: process.env.REACT_APP_BINANCE_PQL_DEX_ADDRESS, // Binance Dex MAINNET Contract Address
    contractABI: PQLDexContractABI,
  },
};

export const STACKING_CONTRACT_ADDRESS = {
  80001: {
    address: process.env.REACT_APP_POLYGON_STACKING_CONTRACT_ADDRESS,
    contractABI: StackingContractABI,
  },

  137: {
    address: process.env.REACT_APP_POLYGON_STACKING_CONTRACT_ADDRESS,
    contractABI: StackingContractABI,
  },

  97: {
    address: process.env.REACT_APP_BINANCE_STACKING_CONTRACT_ADDRESS,
    contractABI: StackingContractABI,
  },

  56: {
    address: process.env.REACT_APP_BINANCE_STACKING_CONTRACT_ADDRESS,
    contractABI: StackingContractABI,
  },
};

export const MORALIS_WSS_ENDPOINT = {
  polygon: {
    endpoint: process.env.REACT_APP_POLYGON_TESTNET_WSS_ENDPOINT, //  Polygon Testnet moralis link
  },
  binance: {
    endpoint: process.env.REACT_APP_BINANCE_TESTNET_WSS_ENDPOINT, //  Binance Testnet moralis link
  },
};

export const COMMON_CONTRACT_ABI = {
  contractABI: CommonContractABI,
};
export const EXPLORER_LINK = {
  polygon: "https://polygonscan.com/token/", //  Polygon MAINNET explorer Url

  binance: "https://www.bscscan.com/token/", // Binance MAINNET explorer Url
};
