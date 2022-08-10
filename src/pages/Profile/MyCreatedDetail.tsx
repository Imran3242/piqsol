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
import ActivityTabContent from "../../components/Profile/ActivityTabContent";
import { getCollectionDetail } from "../../store/reducers/collectionReducer";
import ScrollToTop from "pages/ScrollToTop";

const MyCreatedDetail = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const [data, setData] = useState<any>();
  const [collectionNfts, setCollectionNfts] = useState<any>([]);
  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );

  const getCollectionData = async () => {
    const collectionData = await dispatch(getCollectionDetail(params.id));
    setData(collectionData);
  };

  useEffect(() => {
    getCollectionData();
  }, []);
  useEffect(() => {
    getCollectionData();
  }, [params?.userId, params?.id]);

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
                isUserOwn={params?.userId === currentUser?.id}
                collectionDetails={data}
              />
            }
          />
          <Route
            path="/activity"
            element={
              <ActivityTabContent
                collectionActivity={true}
                userActivity={false}
              />
            }
          />
        </Routes>
      </Container>
    </>
  );
};

export default MyCreatedDetail;
