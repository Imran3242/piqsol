import React, { lazy, Suspense } from "react";
import { Grid } from "@mui/material";
import { useSelector } from "react-redux";
const InfoCard = lazy(() => import("../common/InfoCard"));

const MyFavoritedTabContent = () => {
  const userFavourties = useSelector(
    (state: any) => state.favouriteReducer.userFavourties
  );

  return (
    <Grid container sx={{ marginTop: "20px" }} spacing={3}>
      {userFavourties.map((card: any, index: number) => (
        <Grid key={index} item xs={6} lg={3}>
          <Suspense fallback={<div></div>}>
            <InfoCard
              data={card?.nftId}
              favourite={true}
              showBadges={true}
              auctionData={card?.nftId?.activeAuction}
            />
          </Suspense>
        </Grid>
      ))}
    </Grid>
  );
};

export default MyFavoritedTabContent;
