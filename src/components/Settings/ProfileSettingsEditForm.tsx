import {
  Typography,
  Grid,
  Box,
  InputLabel,
  Button,
  TextField,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import CommunityLinks from "../common/CommunityLinks";
import CopyIcon from "../../assets/icons/copy.png";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Classes from "../../style/Settings/ProfileSettingsForm.module.scss";
import validationSchema from "../Profile/formValidation";
import ImageUpload from "../common/ImageUpload";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserProfile,
  updateUserProfile,
} from "../../store/reducers/authReducer";
import { typeOf } from "react-is";
import { fileUpload } from "helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { extractErrorMessage } from "components/common/helpers/helpers";

const ProfileSettingsEditForm = (props: any) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const wallet: any = useWallet();
  useEffect(() => {
    dispatch(getUserProfile());
  }, []);
  const currentUserData = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const [currentUser, setCurrentUser] = useState<any>({
    avatar: "",
    cover: "",
    name: "",
    url: "",
    description: "",
    domain: "",
    twitter: "",
    medium: "",
    telegram: "",
    discord: "",
  });

  const getCommunityLinkByName = (name: string) => {
    if (currentUserData) {
      if (currentUserData?.communityLinks) {
        const filteredCars = currentUserData?.communityLinks.filter(
          (row: any) => row?.name === name
        );
        const URL = filteredCars[0];
        return URL?.value;
      }
    }
    return "";
  };

  useEffect(() => {
    const initialValues = {
      name: currentUserData ? currentUserData.name : "",
      url: currentUserData ? currentUserData.url : "",
      description: currentUserData ? currentUserData.description : "",
      domain: getCommunityLinkByName("domain"),
      twitter: getCommunityLinkByName("twitter"),
      medium: getCommunityLinkByName("medium"),
      telegram: getCommunityLinkByName("telegram"),
      discord: getCommunityLinkByName("discord"),
    };
    setCurrentUser(initialValues);
  }, [currentUserData]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: currentUser,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitLoading(true);
        const communityLinks = [
          {
            name: "domain",
            value: values.domain,
          },
          {
            name: "twitter",
            value: values.twitter,
          },
          {
            name: "discord",
            value: values.discord,
          },
          {
            name: "telegram",
            value: values.telegram,
          },
          {
            name: "medium",
            value: values.medium,
          },
        ];
        if (formik.values.name.trim() === "") {
          return formik.setFieldError("name", "Name is required");
        }
        if (formik.values.name.trim().length < 4) {
          return formik.setFieldError(
            "name",
            "Name should be of minimum 4 characters length"
          );
        }
        if (
          formik.values.name.replace(/[^a-zA-Z0-9 #]/g, "").trim().length < 4
        ) {
          return formik.setFieldError(
            "name",
            "Special characters are not allowed"
          );
        }
        const formData: any = {
          fullname: values.name,
          url: values.url,
          description: values.description,
          communityLinks: JSON.stringify(communityLinks),
        };
        if (typeof values.cover !== "string") {
          const coverLocation = await fileUpload(values.cover);
          formData.cover = coverLocation;
        }
        if (typeof values.avatar !== "string") {
          const avatarLocation = await fileUpload(values.avatar);
          formData.avatar = avatarLocation;
        }
        await dispatch(updateUserProfile(formData));

        navigate(`/${currentUserData?.id}/myCollected`);
      } catch (err) {
        console.log(
          "🚀 ~ file: ProfileSettingsEditForm.tsx ~ line 93 ~ onSubmit: ~ err",
          err
        );
        dispatch(setMessage(extractErrorMessage(err)));
        dispatch(setIsSuccess(false));
        dispatch(setIsOpen(true));
      } finally {
        setSubmitLoading(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
        formik.handleSubmit();
      }}
      autoComplete="off"
    >
      <ImageUpload
        formik={formik}
        disabled={!props.editProfile}
        currentUserData={currentUserData}
      />
      <Box className={Classes.formWrapper}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box className={Classes.block}>
              <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                Name
              </InputLabel>
              <TextField
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                fullWidth
                type="text"
                placeholder="John"
                id="name"
                disabled={!props.editProfile}
                className={Classes.inputFormControl}
              />
            </Box>

            <Box className={Classes.block}>
              <InputLabel htmlFor="url" className={Classes.inputLabel}>
                URL
              </InputLabel>
              <Typography
                component="p"
                className={Classes.blockCaption}
                sx={{ margin: "10px 0" }}
              >
                Customize your URL on Sirqil, Must only contain lowercase
                letters, numbers, and hyphens.
              </Typography>
              <TextField
                value={formik.values.url}
                onChange={formik.handleChange}
                error={formik.touched.url && Boolean(formik.errors.url)}
                helperText={formik.touched.url && formik.errors.url}
                fullWidth
                type="url"
                placeholder="http://www.yourwebsite.com/"
                id="url"
                disabled={!props.editProfile}
                className={Classes.inputFormControl}
              />
            </Box>

            <Box className={Classes.block}>
              <InputLabel htmlFor="description" className={Classes.inputLabel}>
                Description
              </InputLabel>
              <Typography
                component="p"
                className={Classes.blockCaption}
                sx={{ margin: "10px 0" }}
              >
                {formik?.values.description?.length
                  ? formik?.values.description?.length
                  : 0}{" "}
                of 1000 characters used.
              </Typography>
              <TextField
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
                value={formik.values.description}
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={4}
                disabled={!props.editProfile}
                placeholder="Enter Description Here"
                id="description"
                className={Classes.TextAreaFormControl}
              />
            </Box>
            <CommunityLinks formik={formik} params={props} />
            <Box className={Classes.block}>
              <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                Wallet Address
              </InputLabel>
              <Typography component="div" className={Classes.wallerAddress}>
                <TextField
                  fullWidth
                  type="string"
                  disabled
                  value={currentUserData?.walletAddress}
                  className={Classes.formControlInputAddress}
                />
                <Typography
                  component="div"
                  className={Classes.iconItem}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      currentUserData?.walletAddress
                    );
                  }}
                >
                  <FontAwesomeIcon
                    style={{
                      color: "var(--text-color)",
                      fontSize: "21px",
                      opacity: "0.3",
                    }}
                    icon={faCopy}
                  />
                </Typography>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {props.editProfile ? (
        <Typography
          component="div"
          className={Classes.footerAction}
          style={{
            borderTop: "1px solid var(--border-color)",
            paddingTop: "20px",
          }}
        >
          <LoadingButton
            type="submit"
            variant="contained"
            loading={submitLoading}
            disabled={submitLoading}
            className={`gradientButton ${Classes.createCollection}`}
          >
            {!submitLoading ? "Save Changes" : "Saving Changes"}
            <div className="fill-two"></div>
          </LoadingButton>
          {submitLoading && (
            <Typography
              sx={{ color: "var(--text-color)" }}
              className="warning-msg"
            >
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="color-red"
              />{" "}
              Please wait, don't close the window.
            </Typography>
          )}
        </Typography>
      ) : (
        ""
      )}
    </form>
  );
};

export default ProfileSettingsEditForm;
