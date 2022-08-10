import React, { lazy, Suspense } from "react";
import { Grid, Typography, Box } from "@mui/material";
const MyCreatedCardItem = lazy(() => import("./MyCreatedCardItem"));
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyCreatedCollections,
  setCollections,
} from "store/reducers/collectionReducer";
import { useWallet } from "@solana/wallet-adapter-react";

import { useParams } from "react-router";

const MyCreatedTabContent = () => {
  const createNewCollectionStyle = {
    height: "354px",
    maxWidth: "363px",
    width: "100%",
    border: "2px dashed #C9C9C9",
    borderRadius: "14px",
    backgroundColor: "rgba(127,127,127,0.27)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    opacity: "0.5",
    color: "var(--text-color)",
  };
  const dispatch = useDispatch();
  const wallet = useWallet();
  const params = useParams();

  const curentUserData = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );
  const collections = useSelector(
    (state: any) => state.collectionReducer.collections
  );
  React.useEffect(() => {
    dispatch(getMyCreatedCollections(params?.id));
  }, []);

  React.useEffect(() => {
    dispatch(getMyCreatedCollections(params?.id));
  }, [curentUserData?.id]);

  React.useEffect(() => {
    dispatch(setCollections([]));
  }, [wallet.publicKey]);
  return (
    <Grid container sx={{ marginTop: "20px" }} spacing={3}>
      {params?.id === curentUserData?.id && (
        <Grid item xs={9} lg={4}>
          <Link
            to="/create-collection"
            style={{ textDecoration: "none", color: "#000000" }}
          >
            <Box sx={createNewCollectionStyle}>
              <Typography>
                <Typography sx={{ textAlign: "center" }}>
                  <AddIcon />
                </Typography>
                <Typography
                  sx={{ fontSize: "18px", fontFamily: "Visby CF Bold" }}
                >
                  Create New Collection
                </Typography>
              </Typography>
            </Box>
          </Link>
        </Grid>
      )}
      {collections?.map((row: any, index: number) => (
        <Grid item xs={9} lg={4} key={row._id}>
          <Link
            to={`/${row?.userId?._id}/myCreated/detail/${row._id}/items`}
            key={row._id}
            style={{ textDecoration: "none" }}
          >
            <Suspense fallback={<div></div>}>
              <MyCreatedCardItem data={row} key={row._id} />
            </Suspense>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default MyCreatedTabContent;
