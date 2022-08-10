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
import FiltersSidebar from "components/common/FiltersSidebar";
import { CircularProgress } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CustomSelectStyles from "../../style/Common/CustomSelect.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getAllCollections } from "store/reducers/collectionReducer";
import MyCreatedCardItem from "components/Profile/MyCreatedCardItem";
import ScrollToTop from "pages/ScrollToTop";

const Collections = () => {
  const [page, setPage] = React.useState(1);
  const [isLoading, setLoading] = React.useState(false);
  const [showLoadingBtn, setLoadingBtn] = React.useState(true);
  const [totalDocs, setTotalDocs] = React.useState(0);
  const [Nft, setNft] = React.useState<Array<any>>([]);
  const [filter, setFilter] = React.useState({
    status: "All",
    type: "",
    name: "",
    range: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );

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
      let allCollectedNft: any = await dispatch(
        getAllCollections(selectedfilter, page, 10)
      );
      let auctionsListing = [...Nft, ...allCollectedNft?.docs];
      if (allCollectedNft?.totalDocs) {
        setTotalDocs(allCollectedNft?.totalDocs);
      }
      if (
        allCollectedNft.totalDocs === auctionsListing.length ||
        auctionsListing.length < 10
      ) {
        setLoadingBtn(false);
      }
      setNft(auctionsListing);
      setLoading(false);
    } catch (e) {
      console.log("got error here ====>", e);
    }
  };

  React.useEffect(() => {
    fetchAllNft();
  }, [page, filter]);

  const loadNft = () => {
    const pageSize = page + 1;
    setPage(pageSize);
  };

  const [popularItems, setPopularItems] = React.useState("popular");
  const [allItems, setAllItems] = React.useState("allItems");

  const onChange = (event: any) => {
    if (event.status !== filter.status) {
      setNft([]);
    }
    setFilter({ ...event });
    setPage(1);
    setLoadingBtn(true);
  };

  const CollectionsContent = () => {
    const handleChange = (event: SelectChangeEvent, type: string) => {
      if (type === "popularItems") {
        setPopularItems(event.target.value as string);
      }
      if (type === "allItems") {
        setAllItems(event.target.value as string);
      }
    };

    const onRangeFilterChange = (filter: any) => {
      setNft([]);
      setPage(1);
      setLoadingBtn(true);
      onChange(filter);
    };
    return (
      <Container>
        <ScrollToTop />
        <Box className={Classes.explorePageWrapper}>
          <Grid container className={Classes.titleWrapper}>
            <Grid xs={12} md={6} item>
              <Typography component="h3" className={Classes.pageTitle}>
                Collections
              </Typography>
              <Typography component="h3" className={Classes.metaInfo}>
                {totalDocs} results
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
                        All Items
                      </span>
                    </MenuItem>
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="nfts"
                    >
                      <span
                        className={CustomSelectStyles.menuItemTextItem}
                        onClick={() => navigate(`/explore`)}
                      >
                        Nfts
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
          <Grid container spacing={2} sx={{ marginTop: "20px" }}>
            <Grid item xs={12} md={3}>
              <FiltersSidebar
                onRangeChange={(filters: Object) =>
                  onRangeFilterChange(filters)
                }
                filter={filter}
                onFilterChange={(event: any) => onChange(event)}
                showStatus={false}
                showRange={false}
                showMinted={true}
                showVerification={true}
                showCategories={false}
                showAttributes={false}
                callingFrom="collection"
              />
            </Grid>
            <Grid xs={12} item md={9}>
              <Grid spacing={2} container>
                {Nft?.map((row, index) => (
                  <Grid key={index} xs={12} item lg={4}>
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
              {showLoadingBtn && (
                <Typography component="div" className={Classes.loadMoreWrapper}>
                  <Button
                    onClick={() => loadNft()}
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
      <Route path="/" element={<CollectionsContent />} />
    </Routes>
  );
};

export default Collections;
