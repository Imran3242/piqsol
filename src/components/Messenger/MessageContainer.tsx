import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Typography,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  TextareaAutosize,
  Popover,
  CircularProgress,
  TextField,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Classes from "../../style/Messenger/MessageContainer.module.scss";
import CardMainPhoto from "../../assets/images/card-pic.png";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPaperPlane,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import {
  extractErrorMessage,
  getFormatedDateForMessageCategory,
  getFormatedDayRemaining,
  getQueryForLastSeenUserSelection,
} from "../common/helpers/helpers";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import CardBadge from "../../assets/images/card-badge.png";
import Message from "./Message";
import io from "socket.io-client";
import axios from "axios";
import ScrollableFeed from "react-scrollable-feed";
import Picker, { SKIN_TONE_MEDIUM_DARK } from "emoji-picker-react";
import {
  getIsReadMessageCount,
  setLatestMessage,
} from "store/reducers/messageReducer";
import moment, { isDate } from "moment";
import { fileUpload } from "helpers/helpers";
import {
  getCurrentPrice,
  getCurrentPriceInUSD,
  getCurrentPriceInUSDforMessenger,
} from "utils/helpers/getCurrentPrice";
import { getUserNameOrWalletAddress } from "components/common/helpers/helpers";
import { useNavigate } from "react-router";

import {
  getLatestMessage,
  updateLastSeenByUser,
} from "store/reducers/messageReducer";
import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

var socket: any,
  selectedChatCompare: any = "";
const ENDPOINT: any = process.env.REACT_APP_BASE_URL; //"http://localhost:5000/";

interface MessageContainerType {
  selectedChat: any;
}

const MessageContainer = ({ selectedChat }: MessageContainerType) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElEmoji, setAnchorElEmoji] = useState<null | HTMLElement>(null);

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const [socketConnected, setSocketConnected] = useState(false);
  const [submitting, setSubmitting] = useState(true);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<any>([]);
  const [files, setFiles] = useState<any>([]);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [newMessage, setNewMessage] = useState<any>("");
  const [istyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const open = Boolean(anchorEl);
  const openEmoji = Boolean(anchorElEmoji);

  const handleClickEmoji = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElEmoji(event.currentTarget);
  };

  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const latestMassage = useSelector(
    (state: any) => state.messageReducer.latestMassage
  );
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleFileChange = (e: any) => {
    let files = e.target.files;
    setFiles(Array.from(files));
    setSubmitting(false);
  };
  const Input = styled("input")({
    display: "none",
  });
  const [chatingWith, setChatingWith] = React.useState<any>({});

  const userData = () => {
    if (selectedChat?.userId?._id === currentUser?.id) {
      setChatingWith(selectedChat?.chatWithUserId);
      selectedChatCompare = selectedChat?.chatWithUserId;
    } else {
      setChatingWith(selectedChat?.userId);
      selectedChatCompare = selectedChat?.userId;
    }
  };

  const getLastSeenForUser = () => {
    if (selectedChat?.userId?._id === currentUser?.id) {
      return selectedChat?.chatMetadata?.toUserId?.lastSeen;
    }
    return selectedChat?.chatMetadata?.byUserId?.lastSeen;
  };

  const fetchMessages = async () => {
    try {
      const authToken = localStorage.getItem("authToken") || "";
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "message/getMessages",
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
        data: { chatId: selectedChat?._id, sendToUserId: chatingWith?._id },
      });
      const data = await res?.data;
      await dispatch(getIsReadMessageCount());
      setMessages(data);
      dispatch(setLatestMessage(data[data?.length - 1]));

      socket.emit("join chat", currentUser?.id);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };

  const getPrices = async () => {
    await dispatch(
      updateLastSeenByUser(
        selectedChat?._id,
        getQueryForLastSeenUserSelection(selectedChat, currentUser)
      )
    );
    const currentSolPrice = getCurrentPrice(
      selectedChat?.nftId?.activeAuction,
      selectedChat?.nftId,
      selectedChat?.nftId?.activeAuction?.bids?.sort(
        (a: any, b: any) => b.price - a.price
      )
    );

    const currentUsdPrice = await getCurrentPriceInUSDforMessenger(
      currentSolPrice,
      currentUser
    );

    setCurrentPrice(currentSolPrice);
    setUsdPrice(currentUsdPrice);
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", currentUser);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    getPrices();
  }, []);

  useEffect(() => {
    getPrices();
    fetchMessages();
  }, [selectedChat?._id]);

  useEffect(() => {
    userData();
  }, [currentUser?.id, selectedChat?._id]);

  const updateMessagesOnNewMessageAndSendMessage = (newMessage: any) => {
    try {
      const lengthOfTotalMessages = messages?.length;
      const lastMessage = messages[lengthOfTotalMessages - 1];

      if (
        moment(lastMessage?._id).format("DD-MMM-YYYY") ===
        moment().format("DD-MMM-YYYY")
      ) {
        const updatedLastMessage = {
          _id: lastMessage?._id,
          list: [...lastMessage?.list, newMessage],
          count: lastMessage?.count + 1,
        };

        setMessages([
          ...messages?.slice(0, lengthOfTotalMessages - 1),
          updatedLastMessage,
        ]);
        return;
      }

      setMessages([
        ...messages,
        { _id: moment().format("YYYY-MM-DD"), list: [newMessage], count: 1 },
      ]);
    } catch (err) {
      dispatch(
        setMessage(
          "There is something wrong please try again later" +
            extractErrorMessage(err)
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
      console.log(
        "🚀 ~ file: MessageContainer.tsx ~ line 233 ~ updateMessagesOnNewMessageAndSendMessage ~ err",
        err
      );
    }
  };

  const sendMessage = async (event: any) => {
    try {
      setLoading(true);

      if (newMessage?.trim() === "" && files?.length < 1) {
        return setNewMessage("");
      }
      socket.emit("stop typing", chatingWith?._id);

      const authToken = localStorage.getItem("authToken") || "";

      let filesUpload: any = [];
      for (const file of files) {
        const location = await fileUpload(file);
        filesUpload.push(location);
      }

      const formData = {
        chatId: selectedChat?._id,
        sendToUserId: chatingWith?._id,
        content: newMessage,
        files: JSON.stringify(filesUpload),
        nftId: selectedChat?.nftId?._id,
      };
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_BASE_URL + "message/addMessage",
        headers: {
          "x-auth-token": authToken,
        },
        data: formData,
      });
      const data = res.data;
      setNewMessage("");
      setFiles([]);
      socket.emit("new message", data);
      updateMessagesOnNewMessageAndSendMessage(data);

      dispatch(setLatestMessage(data));
      await dispatch(
        updateLastSeenByUser(
          selectedChat?._id,
          getQueryForLastSeenUserSelection(selectedChat, currentUser)
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    // }
  };
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved: any) => {
      dispatch(setLatestMessage(newMessageRecieved));
      updateMessagesOnNewMessageAndSendMessage(newMessageRecieved);
    });
  });
  const onEmojiClick = (event: any, emojiObject: any) => {
    setNewMessage(newMessage + emojiObject.emoji);
    setSubmitting(false);
  };
  const typingHandler = (e: any) => {
    setNewMessage(e.target.value);
    setSubmitting(false);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", chatingWith._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const getFormatedRemainginDateTime = (toDate) => {
    const daysInHours = moment(toDate).diff(moment(), "hours");

    return getFormatedDayRemaining(daysInHours);
  };

  const handleNftClick = (e) => {
    navigate("/explore/explore-details/" + selectedChat?.nftId?._id);
  };

  const handleSendMessageOnEnterKey = async (event) => {
    if (event.key === "Enter" && !loading) {
      await sendMessage(event);
    }
  };

  const handleCancelFileSelect = (canceledIndex) => {
    const selectedFilesUpdate = files.filter(
      (file, index) => canceledIndex !== index
    );

    setFiles(selectedFilesUpdate);
    setNewMessage("");
  };

  return (
    <Box
      className={Classes.messageContainerWrapper}
      onKeyDown={handleSendMessageOnEnterKey}
    >
      <Typography component="div" className={Classes.headerArea}>
        <Typography component="div" className={Classes.chatInfoWrapper}>
          <Typography component="div">
            <Typography component="div" className={Classes.chatImageWrapper}>
              <img
                loading="lazy"
                src={chatingWith?.cover ? chatingWith?.cover : CardMainPhoto}
                className={Classes.chatUserImg}
                alt="chat user img"
              />
              <img
                loading="lazy"
                src={chatingWith?.avatar ? chatingWith?.avatar : CardMainPhoto}
                className={Classes.profileImg}
                alt="profile img"
              />
            </Typography>
          </Typography>
          <Typography component="div" sx={{ flex: "1" }}>
            <Typography component="h4" className={Classes.userName}>
              {getUserNameOrWalletAddress({ userId: chatingWith })}
            </Typography>
            <Typography component="div" className={Classes.messageInfoWrapper}>
              <Typography component="p" className={Classes.timeAgo}>
                {latestMassage
                  ? `Last Seen: ${moment(getLastSeenForUser()).fromNow()}`
                  : ""}
              </Typography>
            </Typography>
          </Typography>
        </Typography>
        <Typography component="div" className={Classes.timeAgoInfo}>
          <AccessTimeIcon className={Classes.timeIcon} />
          <Typography component="p" className={Classes.timeText}>
            {getFormatedRemainginDateTime(selectedChat?.toDate)}
          </Typography>
        </Typography>
        <IconButton
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <FontAwesomeIcon
            icon={faEllipsisVertical}
            style={{ fontSize: "16px", color: "var(--text-color)" }}
          />
        </IconButton>
      </Typography>
      <Typography
        component="div"
        className={Classes.topMetaInfo}
        onClick={handleNftClick}
      >
        <Typography component="div" className={Classes.info}>
          <Typography component="span" className={Classes.collectionWrapper}>
            <Typography component="span" className={Classes.nftName}>
              {selectedChat?.nftId?.name}
            </Typography>
            <Typography component="span" className={Classes.collectionTitle}>
              {" Collection "}
            </Typography>

            <Typography component="span" className={Classes.collectionName}>
              {selectedChat?.nftId?.collectionId?.fullName}
            </Typography>
          </Typography>
        </Typography>
        <Typography component="div" className={Classes.priceInfo}>
          <img
            loading="lazy"
            src={CardBadge}
            className={Classes.logoImg}
            alt="badge"
          />
          <Typography component="span" className={Classes.priceInfo}>
            {currentPrice}
          </Typography>
          <Typography component="span" className={Classes.price}>
            {`($${usdPrice.toFixed(4)})`}
          </Typography>
        </Typography>
      </Typography>

      <Divider />

      <Typography component="div">
        <ScrollableFeed className={Classes.messageContainer}>
          {messages?.map((row: any, index: number) => (
            <>
              <Typography
                component="div"
                className={Classes.messageArrivedInfo}
              >
                <Typography component="div" className={Classes.badge}>
                  {getFormatedDateForMessageCategory(row?._id)}
                </Typography>
              </Typography>
              {row?.list?.map((message) => (
                <Message
                  data={message}
                  sender={
                    currentUser?.id == message?.sendByUserId ? true : false
                  }
                  key={message?._id}
                />
              ))}
            </>
          ))}
        </ScrollableFeed>
      </Typography>
      <p style={{ marginLeft: "1rem", marginBottom: "2rem" }}>
        {istyping ? " typing..." : <></>}
      </p>
      <Typography component="div" className={Classes.sendMessageWrapper}>
        <TextField
          aria-label="empty textarea"
          placeholder="Write Your Message"
          className={Classes.typeMessageInput}
          autoFocus
          value={newMessage}
          onChange={typingHandler}
          maxRows={3}
          multiline
        />
        <Typography component="div" className={Classes.sendMessageActionArea}>
          <IconButton onClick={handleClickEmoji}>
            <FontAwesomeIcon icon={faFaceSmile} className={Classes.iconSize} />
          </IconButton>
          <Popover
            open={openEmoji}
            anchorEl={anchorElEmoji}
            onClose={handleCloseEmoji}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Picker
              onEmojiClick={onEmojiClick}
              disableAutoFocus={true}
              skinTone={SKIN_TONE_MEDIUM_DARK}
              groupNames={{ smileys_people: "PEOPLE" }}
              native
            />
          </Popover>

          <label htmlFor="icon-button-file" style={{ display: "flex" }}>
            <Input
              accept="image/*"
              multiple={true}
              onChange={(e) => handleFileChange(e)}
              id="icon-button-file"
              type="file"
            />
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <FontAwesomeIcon
                icon={faPaperclip}
                className={Classes.iconSize}
              />
            </IconButton>
          </label>
          {!loading && (
            <IconButton
              disabled={loading}
              onClick={sendMessage}
              className={Classes.sendButton}
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className={Classes.sendIcon}
              />
            </IconButton>
          )}
          {loading && <CircularProgress size="40px" />}
        </Typography>
      </Typography>
      <Typography component="div" className={Classes.uploadFileWrapper}>
        {files?.length > 0 &&
          files?.map((file: any, index) => (
            <Typography component="div" className={Classes.selectedFileWrapper}>
              <CloseOutlinedIcon
                className={Classes.selectCancel}
                onClick={() => {
                  handleCancelFileSelect(index);
                }}
              />
              <Typography className={Classes.fileToUpload}>
                {file?.name}
              </Typography>
            </Typography>
          ))}
      </Typography>
    </Box>
  );
};

export default MessageContainer;
