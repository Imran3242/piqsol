import React, { useState, useEffect, useRef } from "react";

import {
  Card,
  CardMedia,
  Typography,
  CardContent,
  IconButton,
  CardActions,
  Skeleton,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Classes from "style/Explore/ExploreDetailCard.module.scss";
import UserImg from "assets/icons/user.png";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { DDSLoader } from "three-stdlib";

import { Suspense } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserFavouriteNft,
  updateUserNftFavourtie,
} from "store/reducers/favouriteReducer";
import { getUserProfile } from "store/reducers/authReducer";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareWindow from "components/common/ShareWindow";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

const PointLight = ({ pos, intensity }: any) => {
  const [x, y, z] = pos;
  const ref = useRef();
  return (
    <pointLight
      ref={ref}
      args={[0xffffff, 1]}
      intensity={intensity}
      color={"white"}
      position={[x, y, z]}
      castShadow
    />
  );
};

export default function ExploreDetailCard({
  nftDetails,
  auctionData,
  onFractionSelect,
  clearSelection,
  mintedFractionsIndex,
  selectedFraction,
}: {
  nftDetails: any;
  auctionData: any;
  onFractionSelect: any;
  clearSelection: any;
  mintedFractionsIndex?: any;
  selectedFraction?: any;
}) {
  const imgEl = React.useRef<HTMLImageElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loaded, setLoaded] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState<any>({});
  const [fractionsArray, setFractionsArray] = React.useState<any>([]);
  const [file, setFile] = useState<any>({});
  const [openShareModel, setOpenShareModel] = React.useState<boolean>(false);

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const userFavourties = useSelector(
    (state: any) => state.favouriteReducer.userFavourties
  );
  const [isFavourite, setIsFavourite] = React.useState(false);

  const mapFractionsNfts = () => {
    const fractionsArray = auctionData?.fractionDimensions || [];
    fractionsArray?.map((item: any) => {
      const mintedFractionIndex = mintedFractionsIndex?.find(
        (fItem: any) => item.index === fItem.fractionedIndex
      );

      if (mintedFractionIndex) {
        item.minted = true;
      }
      if (item.index === selectedFraction?.index) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    setFractionsArray(fractionsArray);
  };

  useEffect(() => {
    if (clearSelection) mapFractionsNfts();
  }, [clearSelection]);

  useEffect(() => {
    mapFractionsNfts();
    if (imgEl?.current) {
      if (auctionData) {
        onloadImage(imgEl.current);
      }
      setLoaded(true);
    }
  }, [auctionData?._id, imgEl?.current, mintedFractionsIndex]);

  useEffect(() => {
    if (nftDetails) {
      if (nftDetails?.properties?.category === "video") {
        const file = nftDetails?.properties?.files?.find((file: any) =>
          file.type.includes("video")
        );
        setFile(file?.uri);
      }
      if (nftDetails?.properties?.category === "audio") {
        const file = nftDetails?.properties?.files?.find((file: any) =>
          file.type.includes("audio")
        );
        setFile(file?.uri);
      }
    }
  }, [nftDetails?._id]);

  const onloadImage = (res: any) => {
    const displayWidth = res?.offsetWidth;
    const displayHeight = res?.offsetHeight;
    const actualHeight = res?.naturalHeight;
    const actualWidth = res?.naturalWidth;
    const displayWidthFraction =
      displayWidth / Math.sqrt(auctionData.noOfFractions);
    const displayHeightFraction =
      displayHeight / Math.sqrt(auctionData.noOfFractions);
    const imageDimensions = {
      displayHeight,
      displayWidth,
      actualHeight,
      actualWidth,
      displayWidthFraction,
      displayHeightFraction,
    };
    setImageDimensions(imageDimensions);
  };

  useEffect(() => {
    const favourite = userFavourties.find(
      (fav: any) => fav?.nftId?._id === nftDetails?._id
    );
    if (favourite && favourite !== undefined && favourite?.nftId !== null) {
      setIsFavourite(true);
    }
  }, [userFavourties, nftDetails?._id]);

  const updateUserFavourtie = async (e) => {
    e.stopPropagation();
    if (currentUser) {
      const favourtieUpdate: any = await dispatch(
        updateUserNftFavourtie({
          nftId: nftDetails?._id,
        })
      );
      if (favourtieUpdate?.type === "deleted") {
        setIsFavourite(false);
      } else {
        setIsFavourite(true);
      }
      dispatch(getUserFavouriteNft(currentUser?.id));
      dispatch(getUserProfile());
      return;
    }
  };

  const handleShare = () => {
    setOpenShareModel(true);
  };

  const handleCloseShareModel = () => {
    setOpenShareModel(false);
  };
  THREE.DefaultLoadingManager.addHandler(/\.dds$/i, new DDSLoader());

  const VrModel = ({ nftDetails }: any) => {
    const modelFile = nftDetails?.properties?.files?.find(
      (file) => file.type === "obj" || file.type === "glb" || file.type === ""
    );
    if (modelFile?.type === "obj") {
      const obj = useLoader(OBJLoader, modelFile?.uri);

      return <primitive object={obj} scale={0.1} />;
    } else {
    }
    const gltf: any = useLoader(GLTFLoader, modelFile.uri);
    return (
      <Suspense fallback={null}>
        <primitive object={gltf.scene} />
      </Suspense>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <Card className={Classes.exploreDetailCard}>
        {nftDetails?.properties?.category === "image" && (
          <Skeleton
            variant="rectangular"
            style={
              !loaded
                ? { display: "block", height: "538px" }
                : { display: "none" }
            }
            width="100%"
          ></Skeleton>
        )}

        {nftDetails && nftDetails?.properties?.category === "gif" && (
          <CardMedia
            ref={imgEl}
            component="img"
            className={Classes.mainImg}
            image={nftDetails?.image}
            alt="green iguana"
            style={{ height: "538px" }}
          />
        )}

        {nftDetails && nftDetails?.properties?.category === "image" && (
          <>
            <CardMedia
              ref={imgEl}
              component="img"
              className={Classes.mainImg}
              image={nftDetails?.image}
              alt="green iguana"
              style={{ height: "538px" }}
            />

            {fractionsArray.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "538px",
                  flexWrap: "wrap",
                  top: "0",
                  overflow: "hidden",
                }}
              >
                {fractionsArray?.map((item: any) => {
                  return (
                    <div
                      onClick={() => {
                        let fractionsData = fractionsArray;
                        fractionsData.map((fraction: any) => {
                          if (fraction.index === item.index) {
                            return (fraction.selected = true);
                          }
                          return (fraction.selected = false);
                        });
                        setFractionsArray([...fractionsData]);
                        onFractionSelect(item);
                      }}
                      style={{
                        width: imageDimensions?.displayWidthFraction,
                        height: imageDimensions?.displayHeightFraction,
                        borderWidth: 1,

                        borderTopLeftRadius: item?.index === 0 && 15,
                        borderTopRightRadius:
                          item?.index ===
                            Math.sqrt(auctionData?.noOfFractions) - 1 && 15,

                        borderColor:
                          item.selected && item.minted
                            ? "#2D67FF"
                            : item.selected
                            ? "#43F195"
                            : item.minted
                            ? "red"
                            : "rgba(216,216,216,0.38)",
                        borderStyle: "solid",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderTopLeftRadius: item?.index === 0 && 15,
                          borderTopRightRadius:
                            item?.index ===
                              Math.sqrt(auctionData?.noOfFractions) - 1 && 15,
                          backgroundColor:
                            item.selected && item.minted
                              ? "rgb(45, 103, 255,0.38)"
                              : item.selected
                              ? "rgb(67, 241, 149,0.38)"
                              : item.minted
                              ? "rgba(255,0,0,0.38)"
                              : "transparent",
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {nftDetails?.properties?.category === "video" &&
          file &&
          fractionsArray.length === 0 && (
            <video
              height="538"
              className={Classes.mainImg}
              controls
              poster={nftDetails?.image}
            >
              <source src={file} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

        {nftDetails?.properties?.category === "audio" &&
          file &&
          fractionsArray.length === 0 && (
            <div style={{ position: "relative" }}>
              <img
                loading="lazy"
                ref={imgEl}
                height="538"
                className={Classes.mainImg}
                src={nftDetails ? nftDetails?.image : UserImg}
              />
              <audio
                controls
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  background: "white",
                }}
              >
                <source src={file} type="audio/mp3" />
                <p>
                  Your browser doesn't support HTML5 audio. Here is a{" "}
                  <a href="viper.mp3">link to the audio</a> instead.
                </p>
              </audio>
            </div>
          )}

        {nftDetails && nftDetails?.properties?.category === "vr" && (
          <div className={Classes.mainImg} style={{ height: "538px" }}>
            <Canvas>
              <Suspense fallback={null}>
                <PointLight pos={[30, 30, 30]} intensity={1} />
                <ambientLight color="white" intensity={0.2} />
                <VrModel nftDetails={nftDetails} />
                <PointLight pos={[30, 30, -30]} intensity={1} />
                <PointLight pos={[30, 30, 0]} intensity={1} />
                <PointLight pos={[-30, 30, 0]} intensity={1} />

                <OrbitControls />
              </Suspense>
            </Canvas>
          </div>
        )}

        <CardContent className={Classes.cardFooter}>
          <Typography component="div" className={Classes.cardDetails}>
            <Typography component="div" className={Classes.userInfoWrapper}>
              <img
                loading="lazy"
                src={nftDetails.userId?.avatar || UserImg}
                className={Classes.userImg}
              />
              <Typography component="div">
                <Typography component="p" className={Classes.userName}>
                  Owner
                </Typography>
                <Typography component="p" className={Classes.userDesignation}>
                  {nftDetails.userId?.fullName ||
                    nftDetails.userId?.walletAddress}
                </Typography>
              </Typography>
            </Typography>
            <CardActions>
              <Typography className={Classes.info}>
                {nftDetails?.nftType && (
                  <Box className={Classes.viewIconBox}>
                    <Button
                      type="button"
                      sx={{ textDecoration: "underline" }}
                      style={{ color: "var(--text-link)" }}
                      onClick={() =>
                        navigate(
                          `/explore/explore-details/${nftDetails?.parentId?._id}`,
                          { replace: true }
                        )
                      }
                    >
                      <RemoveRedEyeOutlinedIcon
                        style={{ color: "#949494", marginRight: 3 }}
                        className={Classes.viewIcon}
                      />
                      View Parent NFT
                    </Button>
                  </Box>
                )}
              </Typography>
              <IconButton
                onClick={updateUserFavourtie}
                className={Classes.actionBtn}
                aria-label="like"
                size="small"
              >
                <FavoriteIcon
                  className={isFavourite ? Classes.likedIcon : Classes.favIcon}
                />
              </IconButton>

              <IconButton
                className={Classes.actionBtn}
                aria-label="share"
                size="small"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareNodes} />
              </IconButton>

              <IconButton
                className={Classes.actionBtn}
                aria-label="ellipsis"
                size="small"
              >
                <FontAwesomeIcon icon={faEllipsis} />
              </IconButton>
            </CardActions>
          </Typography>
        </CardContent>
        <ShareWindow
          closeShareModel={handleCloseShareModel}
          openShareModel={openShareModel}
          url={`${process.env.REACT_APP_SITE_BASE_URL}explore/explore-details/${nftDetails?._id}`}
        />
      </Card>
    </div>
  );
}
