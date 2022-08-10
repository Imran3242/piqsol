import * as React from "react";
// Material Ui Components
import {
  Typography,
  Box,
  Container,
  FormControl,
  MenuItem,
  Grid,
  Button,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Classes from "style/Explore/Explore.module.scss";
import { Link, useNavigate } from "react-router-dom";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CustomSelectStyles from "../../style/Common/CustomSelect.module.scss";

import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllActiveAuctions,
  getSearchResults,
} from "store/reducers/auctionReducer";
import { getSpecialCharacterReplaced } from "components/common/helpers/helpers";

import MyCreatedCardItem from "components/Profile/MyCreatedCardItem";

import UserProfileCard from "components/common/UserProfileCard";

import FiltersSidebar from "components/common/FiltersSidebar";

import ExploreDetails from "./ExploreDetails";
import InfoCard from "components/common/InfoCard";

const Explore = () => {
  const navigate = useNavigate();
  const [popularItems, setPopularItems] = React.useState("all");
  const [auctions, setAuctions] = React.useState<Array<any>>([]);
  const [totalAuctions, setTotalAuctions] = React.useState<number>(0);
  const [nfts, setNfts] = React.useState<Array<any>>([]);
  const [categoryWiseAuctions, setCategoryWiseAuctions] = React.useState<
    Array<any>
  >([]);
  const [collections, setCollections] = React.useState<Array<any>>([]);
  const [users, setUsers] = React.useState<Array<any>>([]);

  const [filter, setFilter] = React.useState({
    status: "All",
    type: "",
    name: "",
    range: "",
  });
  const [page, setPage] = React.useState(1);
  const [isLoading, setLoading] = React.useState(false);
  const [showLoadingBtn, setLoadingBtn] = React.useState(true);
  const [allItems, setAllItems] = React.useState("allItems");

  const searchedText = useSelector(
    (state: any) => state?.searchReducer?.searchText
  );

  const dispatch = useDispatch();

  const fetchAllAuctions = async () => {
    setLoading(true);

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

    const allActiveAuctions: any = await dispatch(
      getAllActiveAuctions(selectedfilter, page)
    );
    let auctionsListing =
      page > 1
        ? [...auctions, ...allActiveAuctions.docs]
        : allActiveAuctions.docs;

    if (allActiveAuctions.totalDocs === auctionsListing.length) {
      setLoadingBtn(false);
    }
    setTotalAuctions(allActiveAuctions.totalDocs);
    setAuctions(auctionsListing);
    setLoading(false);
  };

  React.useEffect(() => {
    if (!searchedText) {
      setNfts([]);
      setCollections([]);
      setUsers([]);
      fetchAllAuctions();
      setLoadingBtn(true);
    }
  }, [page, filter]);

  const getSearchResultsWithQuery = async () => {
    const { range } = filter;

    let selectedFilters: any = {
      name: getSpecialCharacterReplaced(searchedText),
    };

    if (range !== "") {
      selectedFilters.range = range;
    }
    const data: any = await dispatch(getSearchResults(selectedFilters));
    setCollections(data?.collections);
    setNfts(data?.nfts);
    setUsers(data?.users);
    setLoading(false);
    setLoadingBtn(false);
  };

  React.useEffect(() => {
    if (searchedText) {
      setAuctions([]);
      setLoading(true);
      getSearchResultsWithQuery();
    }
    if (!searchedText) {
      setFilter({ ...filter });
    }
  }, [searchedText]);

  const onChange = (event: any) => {
    if (event.status !== filter.status) {
      setAuctions([]);
    }
    setFilter({ ...event });
    setPage(1);
    setLoadingBtn(true);
  };

  const loadAuctions = () => {
    const pageSize = page + 1;
    setPage(pageSize);
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onRangeFilterChange = (filter: any) => {
    setAuctions([]);
    setPage(1);
    setLoadingBtn(true);
    onChange(filter);
  };
  const ExploreContent = () => {
    const handleChange = (event: SelectChangeEvent, type: string) => {
      if (type === "popularItems") {
        setPopularItems(event.target.value as string);
      }
      if (type === "allItems") {
        setAllItems(event.target.value as string);
      }
    };
    return (
      <Container>
        {/* {page === 1 && <ScrollToTop />} */}
        <Box className={Classes.explorePageWrapper}>
          <Grid container className={Classes.titleWrapper}>
            <Grid xs={12} md={6} item>
              <Typography component="h3" className={Classes.pageTitle}>
                Explore
              </Typography>
              <Typography component="h3" className={Classes.metaInfo}>
                {totalAuctions} Results
              </Typography>
            </Grid>

            <Grid xs={12} md={6} item className={Classes.filtersWrapper}>
              <Typography component="div">
                <FormControl sx={{ Width: "100%" }}>
                  <Select
                    value={allItems}
                    onChange={(e) => handleChange(e, "allItems")}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    IconComponent={() => (
                      <KeyboardArrowDownIcon
                        className={CustomSelectStyles.iconDown}
                      />
                    )}
                    className={CustomSelectStyles.customSelect}
                    MenuProps={{ classes: { paper: "globalDropdown" } }}
                  >
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="allItems"
                    >
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        All items
                      </span>
                    </MenuItem>
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="Collections"
                    >
                      <span
                        className={CustomSelectStyles.menuItemTextItem}
                        onClick={() => navigate(`/collections`)}
                      >
                        Collections
                      </span>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Typography>
              <Typography component="div">
                <FormControl sx={{ Width: "100%" }}>
                  <Select
                    value={popularItems}
                    onChange={(e) => handleChange(e, "popularItems")}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    IconComponent={() => (
                      <KeyboardArrowDownIcon
                        className={CustomSelectStyles.iconDown}
                      />
                    )}
                    className={CustomSelectStyles.customSelect}
                    MenuProps={{ classes: { paper: "globalDropdown" } }}
                  >
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="all"
                    >
                      <span
                        className={`${CustomSelectStyles.menuItemTextItem} ${CustomSelectStyles.opaicty}`}
                      >
                        Sort by:
                      </span>
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        {" "}
                        All
                      </span>
                    </MenuItem>
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="popular"
                    >
                      <span
                        className={`${CustomSelectStyles.menuItemTextItem} ${CustomSelectStyles.opaicty}`}
                      >
                        Sort by:
                      </span>
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        {" "}
                        Popular
                      </span>
                    </MenuItem>
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="new"
                    >
                      <span
                        className={`${CustomSelectStyles.menuItemTextItem} ${CustomSelectStyles.opaicty}`}
                      >
                        Sort by:
                      </span>
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        {" "}
                        New
                      </span>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Typography>
            </Grid>
          </Grid>
          {nfts?.length === 0 &&
            collections?.length === 0 &&
            auctions?.length === 0 &&
            users.length === 0 && (
              <Typography
                sx={{ color: "var(--text-color)", fontFamily: "Visby CF Bold" }}
              >
                No Search Results Found.
              </Typography>
            )}
          <Grid container spacing={2} sx={{ marginTop: "20px" }}>
            <Grid item xs={12} md={3}>
              <FiltersSidebar
                onRangeChange={(filters: Object) =>
                  onRangeFilterChange(filters)
                }
                filter={filter}
                onFilterChange={(event: any) => onChange(event)}
                showStatus={true}
                showRange={true}
                showMinted={true}
                showVerification={true}
                showCategories={true}
                // showCollections={true}
                showAttributes={false}
                callingFrom="explore"
              />
            </Grid>
            <Grid xs={12} item md={9}>
              {auctions?.length > 0 && (
                <Grid spacing={2} container>
                  {auctions.map((auction, index) => (
                    <Grid key={index} item xs={12} lg={4}>
                      {/* <Link
                        to={`/explore/explore-details/${auction.nftId._id}`}
                        onClick={() => onCardClick(auction)}
                        // state={{auctionId: auction._id}}
                        style={{ textDecoration: "none" }}
                      > */}
                      <InfoCard
                        data={{ ...auction?.nftId, userId: auction?.userId }}
                        auctionData={auction}
                        favourite={false}
                        className="exploreCardItem"
                      />

                      {/* </Link> */}
                    </Grid>
                  ))}
                </Grid>
              )}
              {categoryWiseAuctions?.length > 0 && (
                <Grid spacing={2} container>
                  {categoryWiseAuctions.map((auction, index) => (
                    <Grid key={index} item lg={4}>
                      {/* <Link
                        to={`/explore/explore-details/${auction.nftId._id}`}
                        onClick={() => onCardClick(auction)}
                        // state={{auctionId: auction._id}}
                        style={{ textDecoration: "none" }}
                      > */}
                      <InfoCard
                        data={auction}
                        auctionData={auction.activeAuction}
                        favourite={false}
                        className="exploreCardItem"
                      />

                      {/* </Link> */}
                    </Grid>
                  ))}
                </Grid>
              )}

              {users?.length > 0 && (
                <>
                  <Typography
                    sx={{ mb: 2 }}
                    component="h3"
                    className={Classes.pageTitle}
                  >
                    Users
                  </Typography>
                  <Grid sx={{ mb: 2 }} spacing={3} container>
                    {users.map((user, index) => (
                      <Grid key={index} item lg={6}>
                        <UserProfileCard CurentUserData={user} />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {collections?.length > 0 && (
                <>
                  <Typography
                    sx={{ mb: 2 }}
                    component="h3"
                    className={Classes.pageTitle}
                  >
                    Collections
                  </Typography>
                  <Grid sx={{ mb: 2 }} spacing={3} container>
                    {collections?.map((row: any, index: number) => (
                      <Grid item xs={9} lg={4} key={row._id}>
                        <Link
                          to={`/${row?.userId?._id}/myCreated/detail/${row._id}/items`}
                          key={row._id}
                          style={{ textDecoration: "none" }}
                        >
                          <MyCreatedCardItem data={row} key={row._id} />
                        </Link>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {nfts?.length > 0 && (
                <>
                  <Typography
                    sx={{ mb: 2 }}
                    component="h3"
                    className={Classes.pageTitle}
                  >
                    NFTS
                  </Typography>
                  <Grid sx={{ mb: 2 }} spacing={2} container>
                    {nfts.map((nft, index) => (
                      <Grid key={index} xs={9} item lg={4}>
                        <InfoCard
                          data={nft}
                          auctionData={nft.activeAuction}
                          favourite={false}
                          className="exploreCardItem"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {showLoadingBtn && (
                <Typography component="div" className={Classes.loadMoreWrapper}>
                  <Button
                    onClick={() => loadAuctions()}
                    className={Classes.loadMoreButton}
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </Button>
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  };
  return (
    <Routes>
      <Route path="/" element={<ExploreContent />} />
      <Route path="/explore-details/:id" element={<ExploreDetails />} />
    </Routes>
  );
};

export default Explore;
