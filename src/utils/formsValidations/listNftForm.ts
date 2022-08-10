import * as yup from "yup";

export const IMAGE_FILE_SIZE = 10000 * 1024;
const VIDEO_FILE_SIZE = 20000 * 1024;

const urlValidation = yup
  .string()
  .matches(
    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
    "Enter correct url!"
  );

const validationSchema = yup.object({
  nftId: yup.string().required("Please select Nft"),
  mint: yup.string().required("Please select Nft"),
  selectedBlockchain: yup.string().required("Please select Nft"),
  price: yup.string().required("Please add price"),
  duration: yup.date().required('Please select duration'),
  royaltyFee: yup.string().required("Please add royalty fee")

});

export default validationSchema;
