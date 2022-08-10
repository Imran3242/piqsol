import axios from "axios";
import { actions, Connection } from "@metaplex/js";
import { endpoint } from "./getChainNetwork";
import imageCompression from "browser-image-compression";

const uploadFileToIpfs = async (file: any) => {
  try {
    let compressedFile = file;

    if (file?.type?.includes("image")) {
      const compressedBlob = await imageCompression(file, {
        alwaysKeepResolution: true,
        initialQuality: 0.6,
        fileType: file.type,
      });

      compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });
    }

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("uploadTo", "ipfs");
    const response = await axios.post(
      process.env.REACT_APP_BASE_URL + "nft/uploadFile",
      formData
    );
    return response;
  } catch (err) {
    console.log("🚀 ~ Error in ipfs upload", err);
    return err;
  }
};

const uploadJSONToIpfs = async (data: any) => {
  try {
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(data));
    const response = await axios.post(
      process.env.REACT_APP_BASE_URL + "nft/uploadJsonMetadata",
      formData
    );
    return response;
  } catch (err) {
    console.log("🚀 ~ Error in uploading json to ipfs", err);
    return err;
  }
};
const mintFraction = async (
  fractionMetadataUri: any,
  max_supply: any,
  wallet: any
) => {
  try {
    const connection = new Connection(endpoint.url, "confirmed");
    const mintNFTResponse = await actions.mintNFT({
      connection,
      wallet: wallet,
      uri: fractionMetadataUri,
      maxSupply: max_supply,
    });
    return mintNFTResponse;
  } catch (error) {
    console.log(
      "🚀 ~ file: uploadFileToIpfs.ts ~ line 48 ~ mintFraction ~ error",
      error
    );
    return error;
  }
};
export { uploadFileToIpfs, uploadJSONToIpfs, mintFraction };
