import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { setSearchedText } from "store/reducers/searchReducer";
import {
  getImageOfSearchedItem,
  getNameOfSearchedItem,
} from "./helpers/helpers";

interface SearchItemType {
  item: any;
  type: string;
  searchedText?: string;
  handleClose?: Function;
}
const SearchItem = ({
  item,
  type,
  searchedText,
  handleClose,
}: SearchItemType) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const redirectLinks = {
    collections: `/${item?.userId}/myCreated/detail/${item?._id}/items`,
    nfts: "/explore/explore-details/" + item?._id,
    users: `/${item?._id}/myCreated`,
  };

  const handleItemClick = () => {
    searchedText && dispatch(setSearchedText(searchedText));
    handleClose && handleClose(false);
    redirectLinks[type] && navigate(redirectLinks[type]);
  };

  return (
    <ListItem onClick={handleItemClick}>
      <ListItemAvatar>
        <Avatar alt="Searched Image" src={getImageOfSearchedItem(item)} />
      </ListItemAvatar>
      <ListItemText
        className="VisbyBold"
        primary={getNameOfSearchedItem(item)}
      />
    </ListItem>
  );
};
export default SearchItem;
