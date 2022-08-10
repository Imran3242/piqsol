import React from "react";
import {
  Typography,
  Box,
  Container,
  FormControl,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";
import Classes from "../style/Ranking/Ranking.module.scss";
import Select from "@mui/material/Select";
import RankingTable from "../components/Ranking/RankingTable";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { topCollection } from "store/reducers/activityReducer";
import CustomSelectStyles from "../style/Common/CustomSelect.module.scss";
import { useDispatch } from "react-redux";
import { makeStyles } from "@mui/styles";
import ScrollToTop from "./ScrollToTop";

const useStyles = makeStyles({
  root: {
    "& .MuiOutlinedInput-input": {
      paddingLeft: "20px",
    },
  },
});

const Ranking = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const Styles = useStyles();
  const dispatch = useDispatch();
  const [collectionData, setCollectionData] = React.useState<any>([]);
  const [days, setDays] = React.useState<number>(7);
  const getTrendingNfts = async () => {
    setIsLoading(true);
    const data = await dispatch(topCollection(days));
    setCollectionData(data);
    setIsLoading(false);
  };
  React.useEffect(() => {
    getTrendingNfts();
  }, [days]);
  return (
    <>
      <ScrollToTop />
      <Container>
        <Box className={`${Classes.rankingWrapper} ${Styles.root}`}>
          <Grid container className={Classes.titleWrapper}>
            <Grid xs={12} md={4} item>
              <Typography component="h3" className={Classes.pageTitle}>
                Ranking
              </Typography>
              <Typography component="h3" className={Classes.metaInfo}>
                The top NFTs, ranked by volume, floor price
              </Typography>
            </Grid>
            <Grid xs={12} md={8} item className={Classes.filtersWrapper}>
              <Typography component="div">
                <FormControl sx={{ Width: "100%" }}>
                  <Select
                    value={days}
                    onChange={(event) => setDays(event.target.value as number)}
                    className={CustomSelectStyles.customSelect}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    IconComponent={() => (
                      <KeyboardArrowDownIcon
                        className={CustomSelectStyles.iconDown}
                      />
                    )}
                    MenuProps={{ classes: { paper: "globalDropdown" } }}
                  >
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="7"
                    >
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        Last 7 days
                      </span>
                    </MenuItem>
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="15"
                    >
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        Last 15 days
                      </span>
                    </MenuItem>
                    <MenuItem
                      className={CustomSelectStyles.menuItemText}
                      value="30"
                    >
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        Last 30 days
                      </span>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Typography>
            </Grid>
          </Grid>

          <TableContainer className={`${Classes.tableWrapper}`}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ paddingLeft: "0" }}
                    className={Classes.tableHeadCell}
                  >
                    Collection
                  </TableCell>
                  <TableCell className={Classes.tableHeadCell}>
                    Volume
                  </TableCell>
                  <TableCell className={Classes.tableHeadCell}>24h %</TableCell>
                  <TableCell className={Classes.tableHeadCell}>7d %</TableCell>
                  <TableCell className={Classes.tableHeadCell}>
                    Floor Price
                  </TableCell>
                  <TableCell className={Classes.tableHeadCell}>
                    Owners
                  </TableCell>
                  <TableCell
                    className={`${Classes.tableHeadCell} ${Classes.tableLastCell}`}
                    align="right"
                  >
                    Items
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectionData &&
                  collectionData?.map((row: any, index: number) => (
                    <>
                      <RankingTable data={row} keyCount={index} key={index} />
                    </>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Typography component="div" className={Classes.loadMoreWrapper}>
          {isLoading && (
            <Button className={Classes.loadMoreButton}>
              Loading
              <CircularProgress
                style={{ marginLeft: 10 }}
                size={30}
                color="inherit"
              />
            </Button>
          )}
        </Typography>
      </Container>
    </>
  );
};

export default Ranking;
