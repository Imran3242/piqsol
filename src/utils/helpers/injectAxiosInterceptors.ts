import axios from "axios";
import { logOut, setLogOut } from "../../store/reducers/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { setUserFavourite } from "store/reducers/favouriteReducer";
import { setNfts } from "store/reducers/nftReducer";
import { setCollections } from "store/reducers/collectionReducer";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";

export const injectAxiosInterceptors = async ({ setAlertMessage }) => {
  const dispatch = useDispatch();
  let url = "/";
  // Add a response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (err) => {
      if (err.response.status === 401) {
        setTimeout(async () => {
          dispatch(
            setMessage("This user is blocked by admin or unauthorized.")
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          // setAlertMessage({
          //   open: true,
          //   type: "error",
          //   message: "This user is blocked by admin or unauthorized.",
          // });
          const response: any = await dispatch(logOut());
          if (response?.success) {
            dispatch(setLogOut());
            dispatch(setUserFavourite([]));
            dispatch(setNfts([]));
            dispatch(setCollections([]));
          }
        }, 2000);
        // history.replace(url)
        return Promise.reject(err);
      }
      return Promise.reject(err);
    }
  );
  // Add a request interceptor
  axios.interceptors.request.use((request) => {
    return request;
  });
};
