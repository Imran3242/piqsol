import * as React from "react";
import { Box, Typography, InputBase, Button, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Classes from "../../style/Messenger/ConversationContainer.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";

import noMessage from "../../../src/assets/images/no-message.jpg";
import { useSearchParams } from "react-router-dom";
import Conversation from "./Conversation";
import { getAllUsers } from "store/reducers/userReducer";
import { useSelector, useDispatch } from "react-redux";
import { getNftDetails } from "store/reducers/nftReducer";
import { isDataView } from "util/types";
import { any } from "prop-types";
import { getUserNameOrWalletAddress } from "components/common/helpers/helpers";
import { setPreviousChat } from "store/reducers/messageReducer";

interface ConversationContainerType {
  availableChats: any;
  setSelectedChat: any;
}

const ConversationContainer = ({
  availableChats,
  setSelectedChat,
}: ConversationContainerType) => {
  const dispatch = useDispatch();
  const [currentlyAvailableChats, setCurrentlyAvailableChats] =
    React.useState<any>([]);

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  React.useEffect(() => {
    if (availableChats?.length > 0) {
      dispatch(setPreviousChat(availableChats[0]));
      setSelectedChat(availableChats[0]);
    }
  }, []);

  React.useEffect(() => {
    setCurrentlyAvailableChats(availableChats);
  }, [availableChats]);

  const getChatWithUser = (selectedChat) => {
    if (selectedChat?.userId?._id === currentUser?.id) {
      return selectedChat?.chatWithUserId;
    }
    return selectedChat?.userId;
  };

  const filterUsers = (searchValue: any) => {
    if (!searchValue && searchValue === "") {
      setCurrentlyAvailableChats(availableChats);
      return;
    }

    const filterdValue =
      availableChats?.filter((chat: any) =>
        getUserNameOrWalletAddress({
          userId: getChatWithUser(chat),
        })
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      ) || [];

    setCurrentlyAvailableChats(filterdValue);
  };

  return (
    <Box className={Classes.conversationCointainerWrapper}>
      <Typography component="div" className={Classes.headerArea}>
        <Typography component="div" className={Classes.searchWrapper}>
          <SearchIcon className={Classes.searchIcon} />
          <InputBase
            onKeyUp={(e: any) => {
              filterUsers(e.target.value);
            }}
            placeholder="Search messages"
            className={`VisbyBold ${Classes.searchInput}`}
          />
        </Typography>
      </Typography>
      {currentlyAvailableChats?.length > 0 ? (
        <>
          <Typography component="div" className={Classes.archivedActionWrapper}>
            <Button className={Classes.archiveAction}>
              <FontAwesomeIcon
                icon={faBoxArchive}
                className={Classes.actonIcon}
              />
              <Typography component="span" className={Classes.actionText}>
                Archived
              </Typography>
            </Button>
          </Typography>

          <Typography component="div">
            {currentlyAvailableChats?.map((row: any, index: number) => (
              <Conversation
                chat={row}
                setSelectedChat={setSelectedChat}
                chatWithUser={getChatWithUser(row)}
              />
            ))}
          </Typography>
        </>
      ) : (
        <Grid container className={Classes.messageWrapper}>
          <Grid xs={12} md={6} item>
            <img
              loading="lazy"
              src={noMessage}
              alt="No Message"
              className={Classes.emptyImage}
            />
          </Grid>
          <Grid xs={12} md={6} item>
            <Typography className={Classes.emptyMessage}>
              No Chat History Found.
            </Typography>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ConversationContainer;
