import axios from "axios";
import imageCompression from "browser-image-compression";

export const fileUpload = async (file) => {
  try {
    if (!file) {
      return false;
    }

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
    formData.append("uploadTo", "s3");
    const location = await axios.post(
      process.env.REACT_APP_BASE_URL + "nft/uploadFile",
      formData
    );
    return location?.data?.Location;
  } catch (err) {
    console.log("🚀 ~ Error in sending s3 request", err);
    return err;
  }
};
