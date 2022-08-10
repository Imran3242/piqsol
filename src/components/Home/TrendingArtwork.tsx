import React, { lazy, Suspense } from "react";

import { Typography, Container } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { ReactComponent as ArrowLeftIcon } from "../../assets/icons/SVG/ArrowLeftIcon.svg";
import { ReactComponent as ArrowRightIcon } from "../../assets/icons/SVG/ArrowRightIcon.svg";
import { trendingNfts } from "store/reducers/activityReducer";
import "animate.css";
import { AnimationOnScroll } from "react-animation-on-scroll";
import Classes from "../../style/home/TrendingArtwork.module.scss";
import { useDispatch } from "react-redux";
import TRENDING_NFTS from "./Constants/trendingNfts.json";
const InfoCard = lazy(() => import("components/common/InfoCard"));

const TrendingArtwork = () => {
  const dispatch = useDispatch();
  const [trendingNftsData, setTrendingNftsData] = React.useState<any>([]);
  const getTrendingNfts = async () => {
    const data = await dispatch(trendingNfts());
    if (data?.length > 0) {
      setTrendingNftsData(data);
      return;
    }
    setTrendingNftsData(TRENDING_NFTS);
  };
  React.useEffect(() => {
    getTrendingNfts();
  }, []);
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    cssEase: "linear",
    nextArrow: <ArrowRightIcon />,
    prevArrow: <ArrowLeftIcon />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 980,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <div className={`${Classes.TrendingArtwork}`}>
        <Container className="carousel-with-arrows">
          <Typography
            variant="h6"
            className={`VisbyExtrabold ${Classes.heading}`}
          >
            Currently Trending NFTs
          </Typography>

          <Slider {...settings}>
            {trendingNftsData &&
              trendingNftsData?.map((card: any, index: number) => (
                <AnimationOnScroll
                  delay={index * 700 + 500}
                  animateOnce={true}
                  animateIn="animate__zoomIn"
                >
                  <Suspense fallback={<div></div>}>
                    <InfoCard
                      key={index}
                      auctionData={{
                        ...card?.auctionDetail,
                        nftId: card.nftDetail,
                        userId: card?.userDetail,
                      }}
                      data={{ ...card?.nftDetail, userId: card?.userDetail }}
                      className={Classes.cardItem}
                    />
                  </Suspense>
                </AnimationOnScroll>
              ))}
          </Slider>
        </Container>
      </div>
    </>
  );
};

export default TrendingArtwork;
