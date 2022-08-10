import React from "react";
import { Link } from "react-router-dom";
import { Container, Box, Button, Avatar, Typography } from "@mui/material";
import FlorenceSanders from "../../assets/images/collection/FlorenceSanders.png";
import StreamlineArrowRight from "../../assets/icons/streamline-icon-arrow-corner-right.svg";
import { topCollection } from "store/reducers/activityReducer";
import Classes from "../../style/home/Collection.module.scss";
import { useSelector, useDispatch } from "react-redux";
import TRENDING_COLLECTIONS from "./Constants/trendingCollections.json";

function Collection() {
  const dispatch = useDispatch();
  const [collectionData, setCollectionData] = React.useState<any>([]);
  const [days, setDays] = React.useState<number>(7);
  const getTrendingNfts = async () => {
    const data: any = await dispatch(topCollection(days));
    setCollectionData(data?.slice(0, 8) || TRENDING_COLLECTIONS);
  };
  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  React.useEffect(() => {
    getTrendingNfts();
  }, []);

  return (
    <>
      <Container>
        <Box
          className={`animate__animated animate__zoomIn ${Classes.Collection}`}
        >
          <Typography
            variant="h6"
            className={`VisbyExtrabold ${Classes.heading}`}
          >
            Top Collections Last Week
          </Typography>
          <Box className={Classes.collectionSection}>
            {collectionData &&
              collectionData?.slice(0, 10).map((row: any, index: number) => (
                <Box
                  className={Classes.collectionCard}
                  key={"top-collection-" + index}
                >
                  <Link
                    to={`/${row?.collectionCreator}/myCreated/detail/${row?._id}/items`}
                    className="docuration-none"
                    key={"top-collection" + index}
                  >
                    <Box
                      className={`color-black ${Classes.card}`}
                      key={"topcollection" + index}
                    >
                      <Typography className={`VisbyBold ${Classes.count}`}>
                        {index + 1}
                      </Typography>
                      <Avatar
                        className={Classes.collectionAvatar}
                        alt="Florence Sanders"
                        src={row?.cover || FlorenceSanders}
                      />
                      <Typography className={`VisbyExtrabold ${Classes.title}`}>
                        {row?.fullName}
                        <br></br>
                        <span className={`VisbyMedium ${Classes.numbers}`}>
                          {row?.floorPrice?.toFixed(4) || 0}
                        </span>
                      </Typography>
                      <Typography
                        className={`VisbyBold ${
                          row?.avg14days <= row?.avg7days
                            ? Classes.green
                            : Classes.red
                        }`}
                      >
                        {row?.avg14days <= row?.avg7days ? "+" : "-"}
                        {row?.avg7days?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Link>
                </Box>
              ))}
          </Box>

          <Box className={Classes.bottom}>
            <Link to="/ranking">
              <Button
                variant="contained"
                className={`button btn-bg-green`}
                endIcon={
                  <img
                    loading="lazy"
                    src={StreamlineArrowRight}
                    alt="StreamlineArrowRight"
                  />
                }
              >
                Go to Rankings
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </>
  );
}
export default Collection;
