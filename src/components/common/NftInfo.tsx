import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import Classes from "style/Common/NftInfo.module.scss";

const NftInfo = ({ nftDetails }: { nftDetails: any }) => {
  return (
    <>
      <Box className={Classes.nftInfo}>
        <Typography component="div" className={Classes.topInfo}>
          <Typography className={Classes.collection}>Collection:</Typography>
          <Link
            to={
              nftDetails?.collectionId
                ? `/${nftDetails?.userId?._id}/myCreated/detail/${nftDetails?.collectionId?._id}/items`
                : ``
            }
          >
            <Typography className={Classes.sandbox}>
              <Typography component="span" className={Classes.name}>
                {nftDetails?.collectionId
                  ? nftDetails?.collectionId?.fullName
                  : "Imported"}
              </Typography>
              <Typography component="span">
                {nftDetails?.collectionId?.isVerified && (
                  <FontAwesomeIcon icon={faCircleCheck} />
                )}
              </Typography>
            </Typography>
          </Link>
        </Typography>
        <Typography className={Classes.title}>{nftDetails?.name}</Typography>
        <Typography className={Classes.likeWrappers}>
          <Typography className={Classes.info}>
            <RemoveRedEyeOutlinedIcon className={Classes.icon} />
            <Typography className={Classes.count}>
              {nftDetails?.views?.length > 1
                ? `${nftDetails?.views?.length} views`
                : `${nftDetails?.views?.length} view`}
            </Typography>

            <Typography className={Classes.info}>
              <FavoriteOutlinedIcon className={Classes.icon} />
              <Typography className={Classes.count}>
                {nftDetails?.nftFavouriteCount > 1
                  ? `${nftDetails?.nftFavouriteCount} favorites`
                  : `${nftDetails?.nftFavouriteCount} favorite`}
              </Typography>
            </Typography>
          </Typography>
        </Typography>
      </Box>
    </>
  );
};

export default NftInfo;
