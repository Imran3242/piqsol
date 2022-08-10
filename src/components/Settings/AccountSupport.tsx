import React, { useState } from "react";
// Material Ui Components
import {
  Typography,
  Box,
  TextField,
  Grid,
  MenuItem,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import styles from "../../style/Settings/AccountSupport.module.scss";
import { useFormik } from "formik";
import validationSchema from "./formValidation";
import { fileUpload } from "helpers/helpers";
import { useDispatch, useSelector } from "react-redux";
import { userAccountSupport } from "store/reducers/userReducer";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { extractErrorMessage } from "components/common/helpers/helpers";

const howcanhelp = [
  {
    value: "Buying NFTS",
    label: "Buying NFTS",
  },
  {
    value: "Sale NFTS",
    label: "Sale NFTS",
  },
];
const whatcanhelp = [
  {
    value: "Login issue",
    label: "Login issue",
  },
  {
    value: "Other issue",
    label: "Other issue",
  },
];

function AccountSupport() {
  const dispatch = useDispatch();

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [image, setImage] = useState("");
  const [files, setFiles] = useState<any>([]);

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      let files = e.target.files;
      setFiles(files);
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const removeImage = () => {
    setFiles("");
    setImage("");
  };
  const currentUserData = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      helpType: "Buying NFTS",
      helpWith: "Login issue",
      email: "",
      walletAddress: "",
      subject: "",
      description: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitLoading(true);
      try {
        let filesUpload: any = [];
        for (let i = 0; i < files.length; i++) {
          const location = await fileUpload(files[i]);
          filesUpload.push(location);
        }

        const formData = {
          helpType: values.helpType,
          helpWith: values.helpWith,
          email: values.email,
          description: values.description,
          walletAddress: values.walletAddress,
          subject: values.subject,
          files: JSON.stringify(filesUpload),
        };
        await dispatch(userAccountSupport(formData));
        setSubmitLoading(false);
        setSuccess(true);

        dispatch(setMessage("Your message has sent"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));

        setFiles([]);
        resetForm();
      } catch (error: any) {
        dispatch(
          setMessage(
            "There is something wrong please try again later" +
              extractErrorMessage(error)
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        console.log(`Error In Account Support: ${error}`);
      }
    },
  });

  return (
    <Box className={styles.accountSupport}>
      <Box className={styles.profileRightItem}>
        <Typography component="h3" className={styles.pageTitle}>
          Account Support
        </Typography>
        <Typography component="p" className={styles.pageSubTitle}>
          If you need help related to your account, we can help you.
        </Typography>
        {success && (
          <Typography component="p" color="success">
            Message successfully sent
          </Typography>
        )}
        <Box sx={{ mt: 5 }}>
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <Grid container rowSpacing={3} columnSpacing={2}>
              <Grid item xs={12} lg={6}>
                <Box>
                  <Typography
                    component="p"
                    sx={{ mb: 1 }}
                    className={styles.inputLabel}
                  >
                    How can we help?
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      "& .MuiInput-root": { fontSize: 14 },
                      "& .MuiSvgIcon-root": { display: "none" },
                      "& .custom-icon": {
                        display: "block",
                        position: "absolute",
                        right: "26px",
                        top: "17px",
                        opacity: 0.5,
                        color: "var(--text-color)",
                      },
                      py: 1,
                      px: 2,
                      border: "1px solid var(--border-color)",
                      borderRadius: "11px",
                      position: "relative",
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <KeyboardArrowDownIcon className="custom-icon" />
                    <TextField
                      select
                      fullWidth
                      id="helpType"
                      name="helpType"
                      value={formik.values.helpType}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.helpType &&
                        Boolean(formik.errors.helpType)
                      }
                      helperText={
                        formik.touched.helpType && formik.errors.helpType
                      }
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      className={styles.selectItems}
                    >
                      {howcanhelp.map((option) => (
                        <MenuItem
                          style={{
                            color: "var(--text-color)",
                            fontFamily: "Visby CF Bold",
                          }}
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Box>
                  <Typography
                    component="p"
                    sx={{ mb: 1 }}
                    className={styles.inputLabel}
                  >
                    Your email address
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      "& .MuiInput-root": { fontSize: 14 },
                      py: 1,
                      px: 2,
                      border: "1px solid var(--border-color)",
                      borderRadius: "11px",
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <TextField
                      id="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      helperText={formik.touched.email && formik.errors.email}
                      fullWidth
                      placeholder="alllencamber@mail.com"
                      type="email"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      className={styles.inputFormControl}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Box>
                  <Typography
                    component="p"
                    sx={{ mb: 1 }}
                    className={styles.inputLabel}
                  >
                    What can we help with?
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      "& .MuiInput-root": { fontSize: 14 },
                      "& .MuiSvgIcon-root": { display: "none" },
                      "& .custom-icon": {
                        display: "block",
                        position: "absolute",
                        right: "26px",
                        top: "17px",
                        opacity: 0.5,
                        color: "var(--text-color)",
                      },
                      py: 1,
                      px: 2,
                      border: "1px solid var(--border-color)",
                      borderRadius: "11px",
                      position: "relative",
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <KeyboardArrowDownIcon className="custom-icon" />
                    <TextField
                      id="helpWith"
                      name="helpWith"
                      value={formik.values.helpWith}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.helpWith &&
                        Boolean(formik.errors.helpWith)
                      }
                      helperText={
                        formik.touched.helpWith && formik.errors.helpWith
                      }
                      select
                      fullWidth
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      className={styles.selectItems}
                    >
                      {whatcanhelp.map((option) => (
                        <MenuItem
                          style={{
                            color: "var(--text-color)",
                            fontFamily: "Visby CF Bold",
                          }}
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Box>
                  <Typography
                    component="p"
                    sx={{ mb: 1 }}
                    className={styles.inputLabel}
                  >
                    Wallet address
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      "& .MuiInput-root": { fontSize: 14 },
                      py: 1,
                      px: 2,
                      border: "1px solid var(--border-color)",
                      borderRadius: "11px",
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <TextField
                      id="walletAddress"
                      name="walletAddress"
                      value={currentUserData?.walletAddress}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.walletAddress &&
                        Boolean(formik.errors.walletAddress)
                      }
                      helperText={
                        formik.touched.walletAddress &&
                        formik.errors.walletAddress
                      }
                      fullWidth
                      placeholder="Your Wallet Address"
                      type="Text"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      className={styles.inputFormControl}
                      disabled
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={12}>
                <Box>
                  <Typography
                    component="p"
                    sx={{ mb: 1 }}
                    className={styles.inputLabel}
                  >
                    Subject
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      "& .MuiInput-root": { fontSize: 14 },
                      py: 1,
                      px: 2,
                      border: "1px solid var(--border-color)",
                      borderRadius: "11px",
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <TextField
                      id="subject"
                      name="subject"
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.subject && Boolean(formik.errors.subject)
                      }
                      helperText={
                        formik.touched.subject && formik.errors.subject
                      }
                      fullWidth
                      placeholder="Title"
                      type="Text"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      className={styles.inputFormControl}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={12}>
                <Box>
                  <Typography
                    component="p"
                    sx={{ mb: 1 }}
                    className={styles.inputLabel}
                  >
                    Description
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      "& .MuiInput-root": { fontSize: 14 },
                      py: 1,
                      px: 2,
                      border: "1px solid var(--border-color)",
                      borderRadius: "11px",
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <TextField
                      id="description"
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.description &&
                        Boolean(formik.errors.description)
                      }
                      helperText={
                        formik.touched.description && formik.errors.description
                      }
                      fullWidth
                      multiline
                      rows={5}
                      placeholder="Write your issue"
                      type="Text"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      className={styles.TextAreaFormControl}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Box>
                  <Typography
                    component="p"
                    sx={{ mb: 1 }}
                    className={styles.inputLabel}
                  >
                    Attachments <span>(Optional)</span>
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      "& .MuiInput-root": { fontSize: 14 },
                    }}
                    className={styles.fileAttachment}
                    noValidate
                    autoComplete="off"
                  >
                    <Typography component="p" className={styles.fileuploadtxt}>
                      {files.length > 1
                        ? `${(files[0]?.name, files[1]?.name)}...`
                        : files.length > 0
                        ? files[0]?.name
                        : `Add file or drop files here`}
                    </Typography>
                    <input
                      multiple={true}
                      onChange={(e) => handleFileChange(e)}
                      className={styles.fileupload}
                      placeholder="Your Wallet Address"
                      type="file"
                    />
                    {image !== "" && (
                      <>
                        <img src={image} alt="Your Wallet Address" />
                        <CloseIcon
                          className={styles.closeIcon}
                          onClick={removeImage}
                        />
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ mt: 5, mb: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <Button
                disabled={submitLoading}
                type="submit"
                className={styles.subbtn}
              >
                {submitLoading ? "Sending" : "Submit"}
                {submitLoading && (
                  <CircularProgress
                    style={{ color: "#3770e3", marginLeft: 10 }}
                    size={16}
                  />
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

export default AccountSupport;
