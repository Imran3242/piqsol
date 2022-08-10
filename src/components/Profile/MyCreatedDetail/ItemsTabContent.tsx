import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid, Typography, Box, Button } from "@mui/material";
import PageTopFilters from "../../../components/common/PageTopFilters";
import { Link, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { CircularProgress } from "@material-ui/core";
import FiltersSidebar from "../../../components/common/FiltersSidebar";
import Classes from "../../../style/Profile/MyCollectedTabContent.module.scss";

import InfoCard from "../../../components/common/InfoCard";
import {
  getMyCreatedCollections,
  getCollectionNfts,
} from "../../../store/reducers/collectionReducer";
import { getAttributes } from "store/reducers/attributeReducer";
import {
  setCurrentCollection,
  setExpanded,
  setSelectedAttributes,
} from "store/reducers/filterReducer";

const createNewCollectionStyle = {
  height: "442px",
  maxWidth: "273px",
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

interface ItemsTabContentType {
  isUserOwn: boolean;
  collectionDetails: any;
}

const ItemsTabContent = ({
  isUserOwn,
  collectionDetails,
}: ItemsTabContentType) => {
  const params = useParams();
  const dispatch = useDispatch();
  const selectedAttributes = useSelector(
    (state: any) => state?.filterReducer?.selectedAttributes
  );
  const currentCollection = useSelector(
    (state: any) => state?.filterReducer?.currentCollection
  );

  const [filter, setFilter] = React.useState({
    status: {
      attributes: currentCollection === params?.id ? selectedAttributes : [],
    },
    value: "",
  });

  const [page, setPage] = React.useState(1);
  const [attributes, setAttributes] = React.useState<any>([]);

  const [data, setData] = React.useState({});
  const [collectionNfts, setCollectionNfts] = React.useState<any>([]);
  const [isLoading, setLoading] = useState(false);
  const [showLoadingBtn, setLoadingBtn] = useState(true);

  const collections = useSelector(
    (state: any) => state.collectionReducer.collections
  );

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const getPageLimit = () => {
    if (page === 1 && currentUser?.id === params?.userId) {
      return 11;
    }
    return 12;
  };
  const fetchCollectionNfts = async () => {
    try {
      const nfts: any = await dispatch(
        getCollectionNfts(params.id, filter, page, getPageLimit())
      );

      let collectionListing: any = [...collectionNfts, ...nfts?.docs];

      if (
        nfts.totalDocs === collectionListing.length ||
        collectionListing.length < getPageLimit()
      ) {
        setLoadingBtn(false);
      }

      setCollectionNfts(collectionListing);
    } catch (error) {
      console.log("error =====>", error);
    }
  };

  const fetchAttributes = async () => {
    if (currentCollection !== params?.id) {
      dispatch(setSelectedAttributes([]));
      dispatch(setExpanded([]));
    }
    dispatch(setCurrentCollection(params?.id));
    const collectionAttributes: any = await dispatch(getAttributes(params?.id));
    setAttributes(collectionAttributes);
  };

  useEffect(() => {
    fetchCollectionNfts();
  }, [page, filter]);

  useEffect(() => {
    fetchAttributes();
    dispatch(getMyCreatedCollections(params.id));
    dispatch(setCurrentCollection(params?.id));
    fetchCollectionNfts();
  }, [params?.userId, params?.id]);

  useMemo(() => {
    if (collections) {
      const currentData = collections.filter(function (row: any) {
        return row._id === params.id;
      });
      setData(currentData[0]);
    }
  }, [collections]);

  const onRangeFilterChange = (filter: any) => {
    setCollectionNfts([]);
    setPage(1);
    setLoadingBtn(true);
    onChange(filter);
  };

  const onChange = (event: any) => {
    if (!event.status) {
      setCollectionNfts([]);
    }

    if (event.status !== filter.status) {
      setCollectionNfts([]);
    }
    setFilter({ ...event });
    setPage(1);
    setLoadingBtn(true);
  };

  const loadCollection = () => {
    const pageSize = page + 1;
    setPage(pageSize);
  };

  return (
    <Grid container spacing={3} sx={{ marginTop: "20px" }}>
      <Grid item xs={12} md={3}>
        <FiltersSidebar
          showRange={true}
          onRangeChange={(filters: any) => onRangeFilterChange(filters)}
          filter={filter}
          onFilterChange={(event: any) => onChange(event)}
          showAttributes={true}
          showSaleSold={true}
          callingFrom="collection"
          attributes={attributes}
          blockchainType={collectionDetails?.blockchainType?.toLowerCase()}
        />
      </Grid>
      <Grid xs={12} item md={9}>
        <PageTopFilters />
        <Box>
          <Typography mt={3}>
            <Grid spacing={2} container>
              {isUserOwn && currentUser && currentUser?.id === params?.userId && (
                <Grid item xs={9} lg={4}>
                  <Link
                    to={`/create-nft/${params.id}`}
                    style={{ textDecoration: "none", color: "#000000" }}
                  >
                    <Box sx={createNewCollectionStyle}>
                      <Typography>
                        <Typography sx={{ textAlign: "center" }}>
                          <AddIcon />
                        </Typography>
                        <Typography
                          className="VisbyBold"
                          sx={{ fontSize: "18px" }}
                        >
                          Create New Nft
                        </Typography>
                      </Typography>
                    </Box>
                  </Link>
                </Grid>
              )}
              {collectionNfts?.map((nft: any) => (
                <Grid item xs={9} lg={4}>
                  <InfoCard
                    data={nft}
                    isOwned={currentUser?.id === nft?.userId}
                    auctionData={nft?.activeAuction}
                    showBadges={true}
                  />
                </Grid>
              ))}
              {/* 
              <Grid item lg={4}>
                <InfoCard />
              </Grid> */}
              {/* <Grid item lg={4}>
                <InfoCard />
              </Grid> */}
            </Grid>
          </Typography>
        </Box>

        {showLoadingBtn && (
          <Typography component="div" className={Classes.loadMoreWrapper}>
            <Button
              onClick={() => loadCollection()}
              className={Classes.loadMoreButton}
            >
              Load More
              {isLoading && (
                <CircularProgress
                  style={{ marginLeft: 10 }}
                  size={30}
                  color="inherit"
                />
              )}
            </Button>
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default ItemsTabContent;
