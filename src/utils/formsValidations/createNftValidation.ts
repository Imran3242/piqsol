import * as yup from "yup";

export const IMAGE_FILE_SIZE = 100000 * 1024;
const VIDEO_FILE_SIZE = 200000 * 1024;

const urlValidation = yup
  .string()
  .matches(
    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
    "Enter correct url!"
  );

const validationSchema = yup.object({
  nftFile: yup
    .mixed()
    .required("Please select any file")
    .test("fileSize", "File too large", (value) => {
      if (
        value &&
        (value?.type?.includes("video") || value?.type?.includes("audio"))
      ) {
        return value.size <= VIDEO_FILE_SIZE;
      }
      return value && value.size <= IMAGE_FILE_SIZE;
    }),
  name: yup
    .string()
    .min(4, "Name should be of minimum 4 characters length")
    .required("Name is required"),
  fileType: yup.string().required("Please select file type"),
  url: urlValidation,
});

export default validationSchema;
