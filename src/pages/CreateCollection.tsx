import React, { useEffect, useState } from "react";
import Form from "../components/CreateCollection/Form";
// Material Ui Components
import { Typography, Box, Container } from "@mui/material";
// Create Collection style
import Classes from "../style/CreateCollection/CreateCollection.module.scss";
import { WalletModal } from "components/walletAdapter";
import ScrollToTop from "./ScrollToTop";
import { useSelector } from "react-redux";
import { authSelector } from "store/reducers/authReducer";

function CreateCollection() {
  const [visible, setVisible] = useState<boolean>(false);
  const { isAuth } = useSelector(authSelector).authReducer;

  useEffect(() => {
    setVisible(isAuth ? false : true);
  }, [isAuth]);

  return (
    <>
      <ScrollToTop />
      {isAuth ? (
        <Container>
          <Box className={Classes.createCollectionWrapper}>
            <Typography component="h3" className={Classes.pageTitle}>
              Create a Collection
            </Typography>
            <Form />
          </Box>
        </Container>
      ) : (
        <Container className={Classes.createCollectionWrapper}>
          <Typography component="h3" className={Classes.pageTitle}>
            Please Login to Create your Collection.
          </Typography>
        </Container>
      )}
      <WalletModal isVisible={visible} onClose={() => setVisible(false)} />
    </>
  );
}
export default CreateCollection;
