import React from "react";
import { Typography, Button } from "@mui/material";
import CardMainPhoto from "../../assets/images/card-pic.png";
import Classes from "../../style/Messenger/Conversation.module.scss";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import {
  getLatestMessage,
  updateLastSeenByUser,
  setPreviousChat,
} from "store/reducers/messageReducer";
import {
  getQueryForLastSeenUserSelection,
  getUserNameOrWalletAddress,
} from "components/common/helpers/helpers";

interface ConversationType {
  chat: any;
  chatWithUser: any;
  setSelectedChat: any;
}

const Conversation = ({
  chat,
  chatWithUser,
  setSelectedChat,
}: ConversationType) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const previousChat = useSelector(
    (state: any) => state.messageReducer.previousChat
  );

  const handleChatClick = async (event) => {
    await dispatch(
      updateLastSeenByUser(
        previousChat?._id,
        getQueryForLastSeenUserSelection(previousChat?._id, currentUser)
      )
    );
    dispatch(setPreviousChat(chat));
    setSelectedChat(chat);
  };

  const getFormatedMessageForChat = (message: string, files: any) => {
    if (message === "") return `Attachments`;
    if (message?.length > 25) return message?.slice(0, 25) + "...";
    return message;
  };

  return (
    <Button
      type="button"
      className={Classes.conversationButton}
      onClick={handleChatClick}
    >
      <Typography component="div" className={Classes.chatInfoWrapper}>
        <Typography component="div">
          <Typography component="div" className={Classes.chatImageWrapper}>
            <img
              loading="lazy"
              src={chatWithUser?.cover ? chatWithUser.cover : CardMainPhoto}
              className={Classes.chatUserImg}
              alt="chat user img"
            />
            <img
              loading="lazy"
              src={chatWithUser?.avatar ? chatWithUser?.avatar : CardMainPhoto}
              className={Classes.profileImg}
              alt="profile img"
            />
          </Typography>
        </Typography>
        <Typography component="div" sx={{ flex: "1" }}>
          <Typography className={Classes.conversationWrapper}>
            <Typography>
              <Typography component="h4" className={Classes.userName}>
                {getUserNameOrWalletAddress({ userId: chatWithUser })}
              </Typography>
              <Typography component="h4" className={Classes.userId}>
                {chat?.nftId?.name}
              </Typography>
            </Typography>
            {chat?.latestMessage?.isRead === false &&
              chat?.latestMessage?.sendToUserId === currentUser?.id && (
                <Typography className={Classes.newMessage}>
                  New Message
                </Typography>
              )}
          </Typography>
          <Typography component="div" className={Classes.messageInfoWrapper}>
            <Typography component="p" className={Classes.messageText}>
              {getFormatedMessageForChat(
                chat?.latestMessage?.content,
                chat?.latestMassage?.files
              )}
            </Typography>
            <Typography component="p" className={Classes.timeAgo}>
              {chat?.latestMessage
                ? moment(chat?.latestMessage?.createdAt).fromNow()
                : ""}
            </Typography>
          </Typography>
        </Typography>
      </Typography>
    </Button>
  );
};

export default Conversation;
