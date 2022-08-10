import React, { useMemo, useState } from "react";
import { Typography, Grid, Box } from "@mui/material";
import PhotoIcon from "@mui/icons-material/Photo";
import Classes from "../../style/CreateCollection/ImageUpload.module.scss";
import DragDropFileUpload from "./DragDropFileUpload";

import { DropzoneArea } from "material-ui-dropzone";
import "../../style/Common/DragDropFileUpload.scss";

const ImageUpload = ({
  formik,
  disabled,
  currentUserData,
}: {
  formik: any;
  disabled: boolean;
  currentUserData?: any;
}) => {
  const avatar = formik.values.avatar ?? "";
  const cover = formik.values.cover ?? "";
  const [avatarImage, setAvatarImage] = useState<any>();
  const [coverImage, setCoverImage] = useState<any>();

  const handleImageChange = (files: any, type: string) => {
    let reader = new FileReader();
    let file = files[files.length - 1];
    if (file) {
      reader.onloadend = () => {
        if (type === "avatar") setAvatarImage(reader?.result);
        else setCoverImage(reader?.result);
      };
      reader.readAsDataURL(file);
      formik.setFieldValue(type, file);
    }
  };
  const handleImageDrop = (files: any, type: string) => {
    if (type === "avatar") setAvatarImage("");
    else setCoverImage("");

    formik.setFieldValue(type, "");
  };

  useMemo(() => {
    setCoverImage(formik.values.cover);
  }, [formik.values.cover]);

  useMemo(() => {
    setAvatarImage(formik.values.avatar);
  }, [formik.values.avatar]);

  const domRef = React.useRef();

  return (
    <Grid container spacing={2}>
      <Grid item md={6}>
        <Box className={Classes.block}>
          <Typography className={Classes.blockTitle} component="h6">
            Logo Image
          </Typography>
          <Typography component="p" className={Classes.blockDescription}>
            This image will use on your collection thumbnail,
            <br /> 300 x 300 recommended.
          </Typography>

          <Typography component="div" className={`${disabled && "pointerEventsNone"}`}>
            {disabled && currentUserData?.cover ? (
              <img
                loading="lazy"
                src={currentUserData?.avatar}
                className={`${Classes.originalImg} ${Classes.icon}`}
                alt="cardbadge"
              />
            ) : (
              <DragDropFileUpload
                acceptedFiles={[
                  "image/jpg",
                  "image/png",
                  "image/svg+xml",
                  "image/gif, image/jpeg",
                ]}
                handleImageChange={(files: any) =>
                  handleImageChange(files, "avatar")
                }
                handleImageDrop={(files: any) =>
                  handleImageDrop(files, "avatar")
                }
              />
            )}

            <Typography component="p" className={Classes.imageErrorMsg}>
              {formik.errors.avatar || ""}
            </Typography>
          </Typography>

          <Typography component="p" className={Classes.blockCaption}>
            File types supported: JPG, PNG, GIF, SVG. Max size: 100 MB
          </Typography>
        </Box>
      </Grid>
      <Grid item md={6}>
        <Box className={Classes.block}>
          <Typography className={Classes.blockTitle} component="h6">
            Cover Image
          </Typography>
          <Typography component="p" className={Classes.blockDescription}>
            This image will be used on your collection page as <br /> cover
            photo. 600 x 400 recommended.
          </Typography>

          <Typography component="div" className={`${disabled && "pointerEventsNone"}`}>
            {disabled && currentUserData?.cover ? (
              <img
                loading="lazy"
                src={currentUserData?.cover}
                className={`${Classes.originalImg} ${Classes.icon}`}
                alt="cardbadge"
              />
            ) : (
              <DragDropFileUpload
                acceptedFiles={[
                  "image/jpg",
                  "image/png",
                  "image/svg+xml",
                  "image/gif",
                  "image/jpeg",
                ]}
                handleImageChange={(files: any) =>
                  handleImageChange(files, "cover")
                }
                handleImageDrop={(files: any) =>
                  handleImageDrop(files, "cover")
                }
              />
            )}
            <Typography component="p" className={Classes.imageErrorMsg}>
              {formik.errors.cover || ""}
            </Typography>
          </Typography>

          <Typography component="p" className={Classes.blockCaption}>
            File types supported: JPG, PNG, GIF, SVG Max size: 100 MB
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ImageUpload;
