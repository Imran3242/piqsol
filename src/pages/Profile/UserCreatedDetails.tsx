import React, { useEffect, useState, useMemo } from "react";
import MyCreatedBanner from "../../components/Profile/MyCreatedDetail/Banner";
import CustomTabs from "../../components/Profile/MyCreatedDetail/CustomTabs";
import { Container } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";

// Tabs Content
import ItemsTabContent from "../../components/Profile/MyCreatedDetail/ItemsTabContent";
import ActivityTabContent from "../../components/Profile/MyCreatedDetail/ActivityTabContent";
import {
  getMyCreatedCollections,
  getCollectionNfts,
  getCollectionDetail,
} from "../../store/reducers/collectionReducer";
import ScrollToTop from "pages/ScrollToTop";

const UserCreatedDetail = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const [data, setData] = useState<any>({});
  const [collectionNfts, setCollectionNfts] = useState<any>([]);

  const currentUser: any = useSelector(
    (state: any) => state.authReducer.currentUser
  );

  const getCollectionData = async () => {
    const collectionData = await dispatch(getCollectionDetail(params?.userId));
    setData(collectionData);
  };

  useEffect(() => {
    getCollectionData();
  }, []);

  return (
    <>
      <ScrollToTop />
      <MyCreatedBanner data={data} />
      <Container>
        <CustomTabs />
        <Routes>
          <Route
            path="/items"
            element={
              <ItemsTabContent
                isUserOwn={data?.userId?._id === currentUser?.id}
                collectionDetails={data}
              />
            }
          />
          <Route path="/activity" element={<ActivityTabContent />} />
        </Routes>
      </Container>
    </>
  );
};

export default UserCreatedDetail;
