import React, { lazy, Suspense } from "react";
const Banner = lazy(() => import("../components/Home/Banner"));
const TrendingArtwork = lazy(
  () => import("../components/Home/TrendingArtwork")
);
const DiscoverMore = lazy(() => import("../components/Home/DiscoverMore"));
const Collection = lazy(() => import("../components/Home/Collection"));
const CreateNft = lazy(() => import("../components/Home/CreateNft"));
const Video = lazy(() => import("../components/Home/Video"));
const TopCreators = lazy(() => import("../components/Home/TopCreators"));
const Blog = lazy(() => import("../components/Home/Blog"));
const Brands = lazy(() => import("../components/Home/Brands"));
import ScrollToTop from "./ScrollToTop";

function Home() {

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div>.</div>}>
        <Banner />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <TrendingArtwork />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <DiscoverMore />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <Collection />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <CreateNft />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <Video />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <TopCreators />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <Blog />
      </Suspense>

      <Suspense fallback={<div>.</div>}>
        <Brands />
      </Suspense>
    </>
  );
}

export default Home;
