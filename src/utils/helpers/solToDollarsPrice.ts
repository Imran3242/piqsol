import { CHAIN_TYPE_USD_CONVERSION } from "components/common/helpers/helpers";

export const COINGECKO_API = "https://api.coingecko.com/api/v3/";
export const COINGECKO_COIN_PRICE_API = `${COINGECKO_API}simple/price`;
export const solToUSD = async (value: number,chain:string): Promise<number> => {
  const chainId=CHAIN_TYPE_USD_CONVERSION[chain?.toLowerCase()]
  const url = `${COINGECKO_COIN_PRICE_API}?ids=${chainId}&vs_currencies=usd`;
  const resp = await window.fetch(url).then((resp) => resp.json());
  return (resp[chainId]?.usd||0) * value;
};
