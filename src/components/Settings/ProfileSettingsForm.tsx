import { Typography, Grid, Box, InputLabel, TextField } from "@mui/material";
import CopyIcon from "../../assets/icons/copy.png";

import Classes from "../../style/Settings/ProfileSettingsForm.module.scss";

const ProfileSettingsForm = () => {
  return (
    <form action="">
      <Box className={Classes.formWrapper}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box className={Classes.block}>
              <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                Name
              </InputLabel>
              <TextField
                fullWidth
                type="text"
                placeholder="The Monkey Room"
                id="userName"
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
                fullWidth
                type="url"
                placeholder="http://www.yourwebsite.com/"
                id="url"
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
                11 of 1000 characters used.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter Description Here"
                id="description"
                className={Classes.TextAreaFormControl}
              />
            </Box>

            <Box className={Classes.block}>
              <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                Wallet Address
              </InputLabel>
              <Typography component="div" className={Classes.wallerAddress}>
                <TextField
                  fullWidth
                  type="url"
                  placeholder="0x514fe58fc096fdf5d76b20a5b1122d8429600f78"
                  className={Classes.formControlInput}
                />
                <Typography component="div" className={Classes.iconItem}>
                  <img
                    loading="lazy"
                    src={CopyIcon}
                    alt="Copy Icon"
                    className={Classes.icon}
                  />
                </Typography>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default ProfileSettingsForm;
