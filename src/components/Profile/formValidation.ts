import * as yup from "yup";

const FILE_SIZE = 10000 * 1024;
const urlRegax =
  /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
const urlValidation = yup.string().matches(urlRegax, "Enter correct url!");

const validationSchema = yup.object({
  // avatar: yup
  //   .mixed()
  //   .required("avatar is required")
  //   .test("fileSize", "File too large", (value) => {
  //     if (typeof value === "string" && value.match(urlRegax)) {
  //       return true;
  //     }
  //     return value && value.size <= FILE_SIZE;
  //   }),

  name: yup
    .string()
    .min(4, "Name should be of minimum 4 characters length")
    .required("Name is required"),
  url: urlValidation,
  domain: urlValidation,
  telegram: urlValidation,
  discort: urlValidation,
});

export default validationSchema;
