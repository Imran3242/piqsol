import React, { useState, lazy, Suspense } from "react";
import { Grid, InputBase, Typography, Box, Button } from "@mui/material";
import Classes from "../../style/Profile/MyCollectedTabContent.module.scss";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { useParams } from "react-router";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { ENV as ChainId } from "@solana/spl-token-registry";
import { useWallet } from "@solana/wallet-adapter-react";
import SearchIcon from "@mui/icons-material/Search";
const FiltersSidebar = lazy(() => import("../common/FiltersSidebar"));
const InfoCard = lazy(() => import("../common/InfoCard"));
const SearchFilters = lazy(() => import("./SearchFilters"));

import { CircularProgress } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { getMyCollected } from "store/reducers/nftReducer";
import {
  setProfileSearchTextOnFocus,
  setSearchTextOnFocus,
} from "store/reducers/searchReducer";
import { getSpecialCharacterReplaced } from "../common/helpers/helpers";
import { setAuthSuccess } from "store/reducers/authReducer";

const MyCollectedTabContent = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const wallet = useWallet();

  const curentUserData = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );

  const profileSearchOnFocus = useSelector(
    (state: any) => state.searchReducer.profileSearchTextOnFocus
  );

  const [filter, setFilter] = React.useState({
    status: "All",
    type: "",
    name: "",
    range: "",
    search: undefined,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [profileSearchText, setProfileSearchText] = useState<string>(undefined);
  const [showLoadingBtn, setLoadingBtn] = useState(false);
  const [Nft, setNft] = React.useState<Array<any>>([]);

  const fetchAllNft = async () => {
    try {
      let selectedfilter = { ...filter };

      if (filter.status === "All") {
        selectedfilter = { ...selectedfilter, status: "active" };
      } else {
        selectedfilter = {
          ...selectedfilter,
          status: "active",
          type: filter.status,
        };
      }
      setLoading(true);
      setLoadingBtn(true);
      let allCollectedNft: any = await dispatch(
        getMyCollected(selectedfilter, page, params?.id)
      );

      let auctionsListing = [];

      if (page > 1) {
        auctionsListing = [...Nft, ...allCollectedNft?.docs];
      }
      if (page === 1) {
        auctionsListing = [...allCollectedNft?.docs];
      }

      if (
        allCollectedNft?.totalDocs === auctionsListing?.length ||
        auctionsListing?.length < 12
      ) {
        setLoadingBtn(false);
      }
      dispatch(
        setAuthSuccess({
          ...curentUserData,
          nftCount: allCollectedNft?.totalDocs,
        })
      );
      setNft(auctionsListing || []);
      setLoading(false);
    } catch (e) {
      console.log("got error here ====>", e);
    }
  };

  React.useEffect(() => {
    fetchAllNft();
  }, [curentUserData?.id, params?.id]);

  React.useEffect(() => {
    setNft([]);
  }, [wallet.publicKey]);

  React.useEffect(() => {
    if (!profileSearchText) {
      setNft([]);
    }
    fetchAllNft();
  }, [page, filter]);

  React.useEffect(() => {
    if (profileSearchText) {
      setNft([]);
    }
  }, [profileSearchText]);

  const onChange = (event: any) => {
    if (event.status !== filter.status) {
      setNft([]);
    }
    setFilter({ ...event });
    setPage(1);
  };

  const loadNft = () => {
    const pageSize = page + 1;
    setPage(pageSize);
  };

  const onRangeFilterChange = (filter: any) => {
    setProfileSearchText(undefined);
    setNft([]);
    setPage(1);
    onChange(filter);
  };

  const handleProfileSearchChange = (event: any) => {
    if (!event.target.value || event.target.value === "") {
      setLoadingBtn(true);
      setFilter({ ...filter, search: undefined });
      setProfileSearchText(undefined);
      setPage(1);
    }
    if (event.target.value && event.target.value !== "") {
      const searchedFilteredValue = event.target.value.replace(
        /[^a-zA-Z0-9 #]/g,
        ""
      );
      if (searchedFilteredValue.trim() === "") {
        return;
      }

      setFilter({
        ...filter,
        search: getSpecialCharacterReplaced(searchedFilteredValue.trim()),
      });

      setProfileSearchText(searchedFilteredValue);
      setPage(1);
    }
  };

  const handleProfileSearchClick = (event: any) => {
    dispatch(setProfileSearchTextOnFocus(true));
    dispatch(setSearchTextOnFocus(false));
  };

  return (
    <Grid container spacing={3} sx={{ marginTop: "20px" }}>
      <Grid item xs={12} md={3}>
        <Suspense fallback={<div></div>}>
          <FiltersSidebar
            onRangeChange={(filters: Object) => onRangeFilterChange(filters)}
            filter={filter}
            onFilterChange={(event: any) => onChange(event)}
            showStatus={true}
            showRange={true}
            showMinted={true}
            showCategories={true}
            showAttributes={false}
            callingFrom="profile"
            blockchainType={curentUserData?.chainType?.toLowerCase()}
          />
        </Suspense>
      </Grid>
      <Grid xs={12} item md={9}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography component="div" className={Classes.searchWrapper}>
              <SearchIcon className={Classes.searchIcon} />
              <InputBase
                placeholder="Search"
                className={Classes.searchInput}
                autoFocus={profileSearchOnFocus}
                onChange={handleProfileSearchChange}
                defaultValue={undefined}
                value={profileSearchText}
                onClick={handleProfileSearchClick}
              />
              {profileSearchText && (
                <CloseOutlined
                  className={Classes.searchCancel}
                  onClick={() => {
                    setProfileSearchText("");
                    setFilter({ ...filter, search: undefined });
                    dispatch(setSearchTextOnFocus(false));
                  }}
                />
              )}
            </Typography>
          </Grid>
          <Suspense fallback={<div></div>}>
            <SearchFilters />
          </Suspense>
        </Grid>
        <Box>
          <Typography mt={3}>
            {Nft?.length > 0 ? (
              <Grid spacing={2} container>
                {Nft?.map((row: any, index: number) => (
                  <Grid item xs={12} lg={4}>
                    <Suspense fallback={<div></div>}>
                      <InfoCard
                        data={row}
                        className=""
                        favourite={false}
                        auctionData={{
                          ...row.activeAuction,
                          userId: row?.userId,
                        }}
                      />
                    </Suspense>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography
                sx={{ color: "var(--text-color)", fontFamily: "Visby CF Bold" }}
              >
                No search results found
              </Typography>
            )}
          </Typography>
        </Box>

        {showLoadingBtn && (
          <Typography component="div" className={Classes.loadMoreWrapper}>
            <Button
              onClick={() => loadNft()}
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

export default MyCollectedTabContent;
