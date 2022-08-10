import * as React from "react";
import Classes from "../../style/Messenger/Messenger.module.scss";
import { Container, Box, Typography, Grid, Button } from "@mui/material";
import MessageContainer from "../../components/Messenger/MessageContainer";
import ConversationContainer from "../../components/Messenger/ConversationContainer";
import { useSelector, useDispatch } from "react-redux";
import noMessage from "../../../src/assets/images/no-message.jpg";
import { getNotExpiredChats } from "store/reducers/messageReducer";

import ScrollToTop from "pages/ScrollToTop";
const Messenger = () => {
  const dispatch = useDispatch();
  const [availableChats, setAvailableChats] = React.useState<any>(-1);

  const [selectedChat, setSelectedChat] = React.useState<any>({});

  const latestMassage = useSelector(
    (state: any) => state.messageReducer.latestMassage
  );

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const fetchAvailableChats = async (optional = false) => {
    const availableChatsByUser = await dispatch(getNotExpiredChats());
    setAvailableChats(availableChatsByUser);
  };

  React.useEffect(() => {
    fetchAvailableChats();
  }, [currentUser?.id, latestMassage?._id]);

  return (
    <Container>
      <ScrollToTop />
      {currentUser?.id && (
        <Box className={Classes.messengerWrapper}>
          <Typography component="h3" className={`${Classes.pageTitle}`}>
            Messages
          </Typography>
          {availableChats?.length > 0 && (
            <Grid container>
              <Grid item xs={12} md={5}>
                <ConversationContainer
                  availableChats={availableChats}
                  setSelectedChat={setSelectedChat}
                />
              </Grid>

              {selectedChat?._id && (
                <Grid
                  item
                  xs={12}
                  md={7}
                  sx={{ border: "1px solid var(--border-color)" }}
                >
                  <MessageContainer selectedChat={selectedChat} />
                </Grid>
              )}
            </Grid>
          )}

          {availableChats === -1 && (
            <Typography component="div" className={Classes.loadMoreWrapper}>
              <Button className={Classes.loadMoreButton}>Loading...</Button>
            </Typography>
          )}

          {availableChats !== -1 && availableChats?.length === 0 && (
            <Grid container className={Classes.messageWrapper}>
              <Grid xs={12} md={6} item>
                <img loading="lazy" src={noMessage} alt="No Message" />
              </Grid>
              <Grid xs={12} md={6} item>
                <Typography className={Classes.emptyMessage}>
                  No Chat History Found.
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Messenger;
