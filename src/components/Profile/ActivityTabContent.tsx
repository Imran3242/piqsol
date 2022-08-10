import * as React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import Classes from "../../style/Profile/MyActivityTabContent.module.scss";
import ActivityTabPic from "../../assets/images/activity-tab-pic.png";
import { useDispatch } from "react-redux";
import {
  getCollectionActivity,
  getOwnActivity,
} from "store/reducers/activityReducer";
import moment from "moment";
import { getActivityIcons } from "./helpers/helpers";
import { walletAddressString } from "utils/helpers/walletAddressString";
import { useParams } from "react-router";
import {
  CHAIN_CURRENCY,
  getConvertedDecimalPrice,
} from "components/common/helpers/helpers";

interface ActivityTabContectType {
  userActivity?: boolean | undefined;
  collectionActivity?: boolean | undefined;
}

export default function ActivityTabContent({
  userActivity,
  collectionActivity,
}: ActivityTabContectType) {
  const dispatch = useDispatch();
  const params = useParams();

  const [loadMoare, setLoadMore] = React.useState<boolean>(false);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [activites, setActivites] = React.useState<any>([]);

  const [totalPages, setTotalPages] = React.useState<number>(1);

  const getApiCall = async () => {
    if (userActivity) {
      return await dispatch(getOwnActivity(pageNumber, params?.id));
    }
    return await dispatch(getCollectionActivity(pageNumber, params?.id));
  };

  const fetchActivities = async () => {
    try {
      const data: any = await getApiCall();

      setTotalPages(data?.totalPages);

      if (pageNumber === data?.totalPages) {
        setLoadMore(true);
      }
      if (pageNumber > 1) {
        setActivites([...activites, ...data?.docs]);
        return;
      }
      setActivites([...data.docs]);
    } catch (err) {}
  };

  React.useEffect(() => {
    fetchActivities();
  }, []);

  React.useEffect(() => {
    fetchActivities();
  }, [pageNumber]);

  const handlePageNumber = () => {
    if (pageNumber < totalPages) {
      setLoadMore(false);
      setPageNumber(pageNumber + 1);
    }

    if (pageNumber == totalPages) {
      setLoadMore(true);
    }
  };

  const getNameOrWalletAddress = (user) => {
    if (user?.fullName) return user?.fullName;
    return walletAddressString(user?.walletAddress);
  };

  return (
    <TableContainer
      className={Classes.activityTableContainer}
      sx={{ marginTop: "20px" }}
    >
      <Table aria-label="simple table">
        <TableHead className={Classes.tableHead}>
          <TableRow>
            <TableCell className={`VisbyExtrabold ${Classes.tableHeadCell}`}>
              Item
            </TableCell>
            <TableCell className={`VisbyExtrabold ${Classes.tableHeadCell}`}>
              Price
            </TableCell>
            <TableCell className={`VisbyExtrabold ${Classes.tableHeadCell}`}>
              From
            </TableCell>
            <TableCell className={`VisbyExtrabold ${Classes.tableHeadCell}`}>
              To
            </TableCell>
            <TableCell className={`VisbyExtrabold ${Classes.tableHeadCell}`}>
              Date
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activites?.map((row: any, index: number) => (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className={Classes.tableRow}
              key={row._id}
            >
              <TableCell scope="row" key={row._id}>
                <Typography className={Classes.tableCell}>
                  <Typography className={Classes.cellItem}>
                    <img
                      loading="lazy"
                      src={getActivityIcons(row?.type)}
                      alt="icon"
                      className={Classes.icon}
                    />

                    <Typography
                      className="VisbyDemiBold"
                      sx={{ color: "var(--text-color)" }}
                    >
                      {row?.item}
                    </Typography>
                  </Typography>

                  <Typography className={Classes.cellItem}>
                    {row?.nftId?.image ? (
                      <img
                        loading="lazy"
                        src={row?.nftId?.image || ActivityTabPic}
                        alt="transfer arrow icon"
                        className={Classes.userImg}
                      />
                    ) : (
                      <img
                        loading="lazy"
                        src={row?.collectionId?.cover || ActivityTabPic}
                        alt="transfer arrow icon"
                        className={Classes.userImg}
                      />
                    )}

                    {!row?.collectionId?.cover && !row?.nftId?.image && (
                      <img
                        loading="lazy"
                        src={ActivityTabPic}
                        alt="transfer arrow icon"
                        className={Classes.userImg}
                      />
                    )}
                    <Typography>
                      <Typography
                        className={`VisbyDemiBold ${Classes.nftName}`}
                      >
                        {row?.nftId?.name || row?.collectionId?.fullName}
                      </Typography>
                    </Typography>
                  </Typography>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography className={`VisbyDemiBold ${Classes.item}`}>
                  {`${getConvertedDecimalPrice(row?.price) || ""} ${
                    CHAIN_CURRENCY[row?.nftId?.blockchainType?.toLowerCase()]
                  }`}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography className={`VisbyDemiBold ${Classes.metInfo}`}>
                  {getNameOrWalletAddress(row?.fromUserId)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography className={`VisbyDemiBold ${Classes.metInfo}`}>
                  {getNameOrWalletAddress(row?.toUserId)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography className={`VisbyDemiBold ${Classes.item}`}>
                  {moment(row?.createdAt).fromNow()}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography component="div" className={Classes.loadMoreWrapper}>
        <Button
          disabled={loadMoare}
          onClick={handlePageNumber}
          className={`${loadMoare && Classes.disabled} ${
            Classes.loadMoreButton
          }`}
        >
          Load More
        </Button>
      </Typography>
    </TableContainer>
  );
}
