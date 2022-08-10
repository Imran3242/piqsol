import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { CardActionArea, Typography } from "@mui/material";
import Classes from "../../style/Profile/MyCreatedCartItem.module.scss";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { makeStyles } from "@mui/styles";
import { getCreatedByNameForCollection } from "./helpers/helpers";

const useStyles = makeStyles({
  root: {
    "& .MuiCardMedia-media": {
      background: "var(--bg-card)",
    },
    "& .MuiCardContent-root": {
      background: "var(--bg-card)",
    },
  },
});

export default function MyCreatedCardItem(props: { data: any }) {
  const customStyles = useStyles();

  return (
    <>
      <Card
        sx={{ maxWidth: "363px", width: "100%" }}
        className={`${customStyles.root} ${Classes.cardItem}`}
        key={props.data._id}
      >
        <CardActionArea>
          <CardMedia
            component="img"
            height="170"
            image={props.data.cover}
            alt="My Created Image"
          />
          <CardContent className={Classes.contentCard}>
            <Typography component="div" className={Classes.userImgWrapper}>
              <img loading="lazy" src={props.data.avatar} alt="user img" />
            </Typography>
            <Typography
              gutterBottom
              component="div"
              className={Classes.cardName}
            >
              {props?.data?.fullName}
            </Typography>
            <Typography component="div" className={Classes.userInfo}>
              <Typography
                component="div"
                className={`bold ${Classes.createdBy}`}
              >
                Created by
              </Typography>
              <Typography component="span" className={Classes.userName}>
                {getCreatedByNameForCollection(props?.data?.userId)}
              </Typography>
              <Typography component="div">
                {(props?.data?.userId?.isVerified ||
                  props?.data?.isVerified) && (
                  <CheckCircleIcon className={Classes.verifiedIcon} />
                )}
              </Typography>
            </Typography>
            <Typography className={Classes.cardInfo}>
              {props?.data?.description?.substring(0, 100) + "..." || ""}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
}
