import {
  Typography,
  Box,
  InputLabel,
  TextField,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import TwitterIcon from "@mui/icons-material/Twitter";
import Classes from "../../style/Settings/ProfileSettingsForm.module.scss";
import { ReactComponent as DiscordIcon } from "../../assets/icons/SVG/Discord.svg";
import { ReactComponent as TelegramIcon } from "../../assets/icons/SVG/Telegram.svg";
import { ReactComponent as MediumHande } from "../../assets/icons/SVG/Medium.svg";

const CommunityLinks = (props: { formik: any; params: any }) => {
  const formik = props.formik;

  return (
    <>
      <Box className={Classes.block}>
        <InputLabel htmlFor="userName" className={Classes.inputLabel}>
          Community Links
        </InputLabel>
        <Typography component="div" className={Classes.communityLinkWrapper}>
          <Typography component="div" className={Classes.iconItem}>
            <LanguageIcon className={Classes.icon} />
          </Typography>
          <TextField
            disabled={!props.params.editProfile}
            value={formik.values.domain}
            onChange={formik.handleChange}
            error={formik.touched.domain && Boolean(formik.errors.domain)}
            helperText={formik.touched.domain && formik.errors.domain}
            fullWidth
            type="url"
            id="domain"
            placeholder="https://domainname.com"
            className={Classes.formControlInput}
          />
        </Typography>
      </Box>

      <Box className={Classes.block}>
        <Typography component="div" className={Classes.communityLinkWrapper}>
          <Typography component="div" className={Classes.iconItem}>
            <TwitterIcon className={Classes.icon} />
          </Typography>
          <TextField
            disabled={!props.params.editProfile}
            value={formik.values.twitter}
            onChange={formik.handleChange}
            error={formik.touched.twitter && Boolean(formik.errors.twitter)}
            helperText={formik.touched.twitter && formik.errors.twitter}
            fullWidth
            id="twitter"
            placeholder="@YourTwitterHandle"
            className={Classes.formControlInput}
          />
        </Typography>
      </Box>

      <Box className={Classes.block}>
        <Typography component="div" className={Classes.communityLinkWrapper}>
          <Typography component="div" className={Classes.iconItem}>
            <MediumHande />
          </Typography>
          <TextField
            disabled={!props.params.editProfile}
            value={formik.values.medium}
            onChange={formik.handleChange}
            error={formik.touched.medium && Boolean(formik.errors.medium)}
            helperText={formik.touched.medium && formik.errors.medium}
            fullWidth
            id="medium"
            placeholder="@YourMediumHande"
            className={Classes.formControlInput}
          />
        </Typography>
      </Box>

      <Box className={Classes.block}>
        <Typography component="div" className={Classes.communityLinkWrapper}>
          <Typography component="div" className={Classes.iconItem}>
            <TelegramIcon />
          </Typography>
          <TextField
            disabled={!props.params.editProfile}
            value={formik.values.telegram}
            onChange={formik.handleChange}
            error={formik.touched.telegram && Boolean(formik.errors.telegram)}
            helperText={formik.touched.telegram && formik.errors.telegram}
            fullWidth
            type="url"
            id="telegram"
            placeholder="https://t.me/abcdef"
            className={Classes.formControlInput}
          />
        </Typography>
      </Box>

      <Box className={Classes.block}>
        <Typography component="div" className={Classes.communityLinkWrapper}>
          <Typography component="div" className={Classes.iconItem}>
            <DiscordIcon />
          </Typography>
          <TextField
            disabled={!props.params.editProfile}
            value={formik.values.discord}
            onChange={formik.handleChange}
            error={formik.touched.discord && Boolean(formik.errors.discord)}
            helperText={formik.touched.discord && formik.errors.discord}
            fullWidth
            type="url"
            id="discord"
            placeholder="https://discord.gg/abcdef"
            className={Classes.formControlInput}
          />
        </Typography>
      </Box>
    </>
  );
};

export default CommunityLinks;
