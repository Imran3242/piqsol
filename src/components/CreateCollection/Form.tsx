import React, { useState } from "react";
import {
  TextareaAutosize,
  Typography,
  Grid,
  Box,
  InputLabel,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import LanguageIcon from "@mui/icons-material/Language";
import TwitterIcon from "@mui/icons-material/Twitter";
import TextField from "@mui/material/TextField";
import ImageUpload from "../common/ImageUpload";
import validationSchema from "./formValidation";
import Classes from "../../style/CreateCollection/Form.module.scss";
import { createCollection } from "../../store/reducers/collectionReducer";
import { fileUpload } from "helpers/helpers";
import { ReactComponent as DiscordIcon } from "../../assets/icons/SVG/Discord.svg";
import { ReactComponent as TelegramIcon } from "../../assets/icons/SVG/Telegram.svg";
import { ReactComponent as MediumHande } from "../../assets/icons/SVG/Medium.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import {
  CHAIN_LOGOS,
  CHAIN_TITLE,
  extractErrorMessage,
} from "components/common/helpers/helpers";
import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

const Form = () => {
  const dispatch = useDispatch();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
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
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitLoading(true);
        const avatarLocation = await fileUpload(values.avatar);
        const coverLocation = await fileUpload(values.cover);

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

        const formData = {
          fullName: values.name,
          url: values.url,
          description: values.description,
          cover: coverLocation,
          avatar: avatarLocation,
          communityLinks: JSON.stringify(communityLinks),
          blockchainType: currentUser?.chainType,
        };
        const createdCollection: any = await dispatch(
          createCollection(formData)
        );
        setSubmitLoading(false);
        dispatch(setMessage("Collection Created Successfully"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(true));
        navigate(
          `/${currentUser?.id}/myCreated/detail/${createdCollection?._id}/items`
        );
      } catch (error: any) {
        console.log("Error While Creating Collection", error);
        dispatch(
          setMessage(
            `Error In Creating Collection: ${extractErrorMessage(error)}`
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
      }
    },
  });
  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <Grid
        item
        xs={12}
        md={6}
        component="div"
        className={Classes.actionsWrapper}
      >
        <Box className={Classes.block}>
          <Button className={`${Classes.grayBtn} ${Classes.actionBtn}`}>
            You Are Minting On:&nbsp;
            <span style={{ fontFamily: "Visby CF Bold" }}>
              {CHAIN_TITLE[currentUser?.chainType]}
            </span>
            <img
              src={CHAIN_LOGOS[currentUser?.chainType]}
              className={Classes.btnLogo}
              alt="cardbadge"
            />
          </Button>
        </Box>
      </Grid>
      <ImageUpload formik={formik} disabled={false} />
      <Box className={Classes.formWrapper}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className={Classes.block}>
              <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                Name
              </InputLabel>
              <TextField
                fullWidth
                type="text"
                id="name"
                value={formik.values.name.replace(/[^a-zA-Z0-9 #]/g, "")}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                FormHelperTextProps={{
                  className: Classes.errorMsg,
                }}
                className={Classes.inputFormControl}
              />
            </Box>

            <Box className={Classes.block}>
              <InputLabel
                htmlFor="url"
                className={Classes.inputLabel}
                style={{ marginBottom: "0" }}
              >
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
                fullWidth
                type="text"
                placeholder="http://www.yourwebsite.com"
                className={Classes.inputFormControl}
                id="url"
                value={formik.values.url}
                onChange={formik.handleChange}
                error={formik.touched.url && Boolean(formik.errors.url)}
                helperText={formik.touched.url && formik.errors.url}
              />
            </Box>

            <Box className={Classes.block}>
              <InputLabel
                htmlFor="description"
                className={Classes.inputLabel}
                style={{ marginBottom: "0" }}
              >
                Description
              </InputLabel>
              <Typography
                component="p"
                className={Classes.blockCaption}
                sx={{ margin: "10px 0" }}
              >
                {formik?.values.description?.length} of 1000 characters used.
              </Typography>
              <TextareaAutosize
                minRows={3}
                placeholder="Enter Description Here"
                id="description"
                className={Classes.TextAreaFormControl}
                value={formik.values.description}
                onChange={(e) =>
                  e.target.value?.length <= 1000 && formik.handleChange(e)
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={Classes.block}>
              <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                Community Links
              </InputLabel>
              <Typography
                component="div"
                className={Classes.communityLinkWrapper}
              >
                <Typography component="div" className={Classes.iconItem}>
                  <LanguageIcon className={Classes.icon} />
                </Typography>
                <TextField
                  fullWidth
                  type="url"
                  id="domain"
                  placeholder="https://domainname.com"
                  className={Classes.formControlInput}
                  value={formik.values.domain}
                  onChange={formik.handleChange}
                  error={formik.touched.domain && Boolean(formik.errors.domain)}
                  helperText={formik.touched.domain && formik.errors.domain}
                />
              </Typography>
            </Box>

            <Box className={Classes.block}>
              <Typography
                component="div"
                className={Classes.communityLinkWrapper}
              >
                <Typography component="div" className={Classes.iconItem}>
                  <TwitterIcon className={Classes.icon} />
                </Typography>
                <TextField
                  id="twitter"
                  onChange={formik.handleChange}
                  error={
                    formik.touched.twitter && Boolean(formik.errors.twitter)
                  }
                  helperText={formik.touched.twitter && formik.errors.twitter}
                  fullWidth
                  type="string"
                  className={Classes.formControlInput}
                  placeholder="@YourTwitterHandle"
                />
              </Typography>
            </Box>

            <Box className={Classes.block}>
              <Typography
                component="div"
                className={Classes.communityLinkWrapper}
              >
                <Typography component="div" className={Classes.iconItem}>
                  <MediumHande />
                </Typography>
                <TextField
                  id="medium"
                  onChange={formik.handleChange}
                  error={formik.touched.medium && Boolean(formik.errors.medium)}
                  helperText={formik.touched.medium && formik.errors.medium}
                  fullWidth
                  type="string"
                  className={Classes.formControlInput}
                  placeholder="@YourMediumHande"
                />
              </Typography>
            </Box>

            <Box className={Classes.block}>
              <Typography
                component="div"
                className={Classes.communityLinkWrapper}
              >
                <Typography component="div" className={Classes.iconItem}>
                  <TelegramIcon />
                </Typography>
                <TextField
                  id="telegram"
                  fullWidth
                  type="url"
                  placeholder="https://t.me/abcdef"
                  className={Classes.formControlInput}
                  value={formik.values.telegram}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.telegram && Boolean(formik.errors.telegram)
                  }
                  helperText={formik.touched.telegram && formik.errors.telegram}
                />
              </Typography>
            </Box>

            <Box className={Classes.block}>
              <Typography
                component="div"
                className={Classes.communityLinkWrapper}
              >
                <Typography component="div" className={Classes.iconItem}>
                  <DiscordIcon />
                </Typography>
                <TextField
                  id="discord"
                  onChange={formik.handleChange}
                  error={
                    formik.touched.discord && Boolean(formik.errors.discord)
                  }
                  helperText={formik.touched.discord && formik.errors.discord}
                  fullWidth
                  type="url"
                  placeholder="https://discord.gg/abcdef"
                  className={Classes.formControlInput}
                />
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography component="div" className={Classes.footerAction}>
        <Button
          disabled={submitLoading}
          type="submit"
          variant="contained"
          className={`gradientButton ${Classes.createCollection}`}
        >
          {submitLoading ? "Creating" : "Create Collection"}
          {submitLoading && (
            <CircularProgress
              style={{ color: "#3770e3", marginLeft: 10 }}
              size={16}
            />
          )}
          <div className="fill-two"></div>
        </Button>
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
    </form>
  );
};

export default Form;
