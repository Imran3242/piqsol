import React, { FC, lazy, Suspense, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import Hoc from "./layout/Hoc";
const Home = lazy(() => import("./pages/Home"));
const CreateCollection = lazy(() => import("./pages/CreateCollection"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const MyCreatedDetail = lazy(() => import("./pages/Profile/MyCreatedDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const Explore = lazy(() => import("./pages/Explore/Explore"));
const CreateNft = lazy(() => import("./pages/CreateNft"));
const Staking = lazy(() => import("./pages/Stacking"));
const BlogSinglepage = lazy(() => import("./pages/Blog/BlogSinglepage"));
const Resources = lazy(() => import("./pages/Resources"));
const Messenger = lazy(() => import("./pages/Messenger/Messenger"));
const Ranking = lazy(() => import("./pages/Ranking"));
const ListItemForSale = lazy(
  () => import("./pages/ListItemForSale/ListItemForSale")
);
const Collections = lazy(() => import("./pages/Collections/Collections"));
const NFTSummary = lazy(() => import("pages/ListItemForSale/NFTSummary"));

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

import { useDispatch, useSelector } from "react-redux";
import { setLogOut } from "store/reducers/authReducer";
import { setUserFavourite } from "store/reducers/favouriteReducer";
import { setNfts } from "store/reducers/nftReducer";
import { setCollections } from "store/reducers/collectionReducer";
import { isMetaMaskAvailable } from "web3/web3";
import ErrorSuccessMessage from "components/common/ErrorSuccessMessage";
import { setIsOpen } from "store/reducers/errorSuccessMessageReducer";
import NftAgreement from "pages/NftAgreement";
require("@solana/wallet-adapter-react-ui/styles.css");

export const App: FC = () => {
  const network: any = process.env.REACT_APP_NETWORK;

  const dispatch = useDispatch();

  const openModal = useSelector(
    (state: any) => state.errorSuccessMessageReducer?.isOpen
  );
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  window.scrollTo(0, 0);

  React.useEffect(() => {
    if (isMetaMaskAvailable()) {
      (window as any).ethereum.on("accountsChanged", (accounts: any) => {
        if (accounts?.length === 0) {
          dispatch(setLogOut());
          dispatch(setUserFavourite([]));
          dispatch(setNfts([]));
          dispatch(setCollections([]));

          return;
        }
      });
    }
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network]
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Router>
              <Hoc>
                <Suspense fallback={<div>..</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/create-collection"
                      element={<CreateCollection />}
                    />
                    {/* Profile Routes start */}
                    <Route path=":id/*" element={<Profile />} />
                    <Route
                      path=":userId/myCreated/detail/:id/*"
                      element={<MyCreatedDetail />}
                    />
                    {/* <Route
                    path=":userId/userCreated/detail/:id/*"
                    element={<UserCreatedDetail />}
                  /> */}
                    {/* Profile Routes end */}
                    <Route path="/settings" element={<Settings />} />
                    <Route path="explore/*" element={<Explore />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/create-nft/:id" element={<CreateNft />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/messenger" element={<Messenger />} />
                    <Route
                      path="listItemForSale/:id"
                      element={<ListItemForSale />}
                    />
                    <Route path="/nft-summary" element={<NFTSummary />} />
                    <Route path="/staking" element={<Staking />} />
                    <Route
                      path="/blogSinglepage/:id"
                      element={<BlogSinglepage />}
                    />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/stacking" element={<Staking />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route
                      path="/terms-and-conditions"
                      element={<TermsAndConditions />}
                    />
                    <Route
                      path="/nft-agreement"
                      element={<NftAgreement />}
                    />
                  </Routes>
                </Suspense>
              </Hoc>
            </Router>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>

      {openModal && (
        <ErrorSuccessMessage onClose={() => dispatch(setIsOpen(false))} />
      )}
    </>
  );
};
