import * as React from "react";
import { Typography, TableCell, TableRow } from "@mui/material";
import Classes from "../../style/Ranking/RankingTable.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { getConvertedDecimalPrice } from "components/common/helpers/helpers";
import { Link } from "react-router-dom";

const RankingTable = (props: { data: any; keyCount: number }) => {
  const { data, keyCount } = props;

  const increase7Days = data?.avg14days <= data?.avg7days;
  const increase24Hours = data?.avg48Hours <= data?.avg24Hours;

  const getFormatedValue = (value) => {
    if (value.toString()?.includes(".")) {
      return getConvertedDecimalPrice(value);
    }
    return value;
  };

  return (
    <TableRow key={data._id}>
      <TableCell sx={{ paddingLeft: "0" }}>
        <Link
          to={`/${data?.collectionCreator}/myCreated/detail/${data?._id}/items`}
          style={{ textDecoration: "none" }}
        >
          <Typography component="div" className={Classes.collectionInfoWrapper}>
            <Typography
              component="span"
              className={Classes.collectionInfoCount}
            >
              {keyCount + 1}
            </Typography>
            <Typography component="div" className={Classes.userInfoWrapper}>
              <Typography component="div" className={Classes.userInfo}>
                <img
                  loading="lazy"
                  src={data?.cover}
                  alt="user img"
                  className={Classes.userImg}
                />
                {data?.isVerified && (
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className={Classes.verifiedIcon}
                  />
                )}
              </Typography>
              <Typography component="p" className={Classes.userName}>
                {data?.fullName}
              </Typography>
            </Typography>
          </Typography>
        </Link>
      </TableCell>
      <TableCell className={`${Classes.tableBodyCell}`}>
        {getConvertedDecimalPrice(data?.avgVolum)} SOL
      </TableCell>
      <TableCell
        className={`${Classes.tableBodyCell} ${
          increase24Hours ? Classes.textGreen : Classes.textRed
        }`}
      >
        {`${increase24Hours ? "+" : "-"}${getFormatedValue(data?.avg24Hours)}%`}
      </TableCell>
      <TableCell
        className={`${Classes.tableBodyCell} ${
          increase7Days ? Classes.textGreen : Classes.textRed
        }`}
      >
        {`${increase7Days ? "+" : "-"}${getFormatedValue(data?.avg7days)}%`}
      </TableCell>
      <TableCell className={`${Classes.tableBodyCell}`}>
        {getConvertedDecimalPrice(data?.floorPrice)} SOL
      </TableCell>
      <TableCell className={`${Classes.tableBodyCell}`}>
        {data?.owners}
      </TableCell>
      <TableCell
        className={`${Classes.tableBodyCell} ${Classes.tableLastCell}`}
        align="right"
      >
        {data?.collNftsCount}
      </TableCell>
    </TableRow>
  );
};

export default RankingTable;
