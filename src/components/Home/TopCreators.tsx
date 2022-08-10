import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import willieGibson from "../../assets/images/topCreators/willie-gibson.png";
import { useDispatch } from "react-redux";
import Classes from "../../style/home/TopCreators.module.scss";
import { trendingNfts } from "store/reducers/activityReducer";
function TopCreators() {
  const dispatch = useDispatch();
  const [topCreators, setTopCreators] = React.useState<any>([]);
  const getTrendingNfts = async () => {
    const data = await dispatch(trendingNfts());
    setTopCreators(data);
  };
  React.useEffect(() => {
    getTrendingNfts();
  }, []);
  return (
    <>
      <Box
        className={`animate__animated animate__zoomIn ${Classes.TopCreators}`}
      >
        <Typography
          variant="h6"
          className={`VisbyExtrabold ${Classes.heading}`}
        >
          Top Creators
        </Typography>
        <Box className={Classes.chipsSection}>
          {topCreators &&
            topCreators?.slice(0, 10).map((row: any, index: number) => (
              <Box className={Classes.chipCard}>
                <Avatar
                  className={Classes.chipAvatar}
                  alt="willieGibson"
                  src={row?.userDetail?.avatar ?? willieGibson}
                />

                <Typography className="VisbyExtrabold">
                  {row?.userDetail?.fullName}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>
    </>
  );
}

export default TopCreators;
