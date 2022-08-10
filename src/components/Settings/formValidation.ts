import * as yup from "yup";

const validationSchema = yup.object({
  helpType: yup.string().required("Help type is required"),
  helpWith: yup.string().required("Help with is required"),
  email: yup.string().email().required("Email is required"),
  subject: yup.string().required("Subject is required"),
  // walletAddress: yup.string().required("Wallet address is required"),
  description: yup.string().required("Description is required"),
});

export default validationSchema;
