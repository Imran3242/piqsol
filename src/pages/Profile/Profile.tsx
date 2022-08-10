import React, { useEffect, useState } from "react";
import ProfileBanner from "../../components/Profile/ProfileBanner";
import ProfileCustomTabs from "../../components/Profile/ProfileCustomTabs";
import { Container, Typography, Box } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
// Tabs Content
import MyCollectedTabContent from "../../components/Profile/MyCollectedTabContent";
import MyCreatedTabContent from "../../components/Profile/MyCreatedTabContent";
import MyFavoritedTabContent from "../../components/Profile/MyFavoritedTabContent";
import ActivityTabContent from "../../components/Profile/ActivityTabContent";
import MyWalletTabContent from "../../components/Profile/MyWalletTabContent";
import ScrollToTop from "pages/ScrollToTop";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "store/reducers/userReducer";
import { setAuthSuccess } from "store/reducers/authReducer";

const Profile = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const [isOwner, setIsOwner] = useState(true);

  const fetchAndUpdateUserData = async () => {
    const userData: any = await dispatch(fetchUserDetails(params?.id));
     dispatch(setAuthSuccess({ ...userData, id: userData?._id }));
  };
  useEffect(()=>{
    if (params?.id !== currentUser?.id) {
      setIsOwner(false);
    }
    if (params?.id === currentUser?.id) {
      fetchAndUpdateUserData();
      setIsOwner(true);
    }
  },[])

  useEffect(() => {
    if (params?.id !== currentUser?.id) {
      setIsOwner(false);
    }
    if (params?.id === currentUser?.id) {
      fetchAndUpdateUserData();
      setIsOwner(true);
    }
  }, [currentUser?.id, params?.id]);

  return (
    <Box sx={{ paddingBottom: "100px" }}>
      <ScrollToTop />
      <ProfileBanner />
      <Container>
        <Typography
          sx={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "30px",
            color: "var(--text-color)",
          }}
          className="VisbyExtrabold"
          component="h2"
        >
          {" "}
          Profile Dashboard
        </Typography>
        <ProfileCustomTabs isOwner={isOwner} />
        <Routes>
          {isOwner && (
            <Route path="/myCollected" element={<MyCollectedTabContent />} />
          )}
          <Route path="/myCreated" element={<MyCreatedTabContent />} />
          {isOwner && (
            <Route path="/myFavorited" element={<MyFavoritedTabContent />} />
          )}
          {isOwner && (
            <Route
              path="/myActivity"
              element={
                <ActivityTabContent
                  userActivity={true}
                  collectionActivity={false}
                />
              }
            />
          )}
          {isOwner && (
            <Route path="/myWallet" element={<MyWalletTabContent />} />
          )}
        </Routes>
      </Container>
    </Box>
  );
};

export default Profile;
