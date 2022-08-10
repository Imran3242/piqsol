import * as React from "react";
// Material Ui Components
import { Typography, Box, Grid, Card } from "@mui/material";
import Classes from "style/Explore/CarouselCards.module.scss";
import "../../style/Common/CarouselWithArrow.scss";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { ReactComponent as ArrowLeftIcon } from "../../assets/icons/SVG/ArrowLeftIcon.svg";
import { ReactComponent as ArrowRightIcon } from "../../assets/icons/SVG/ArrowRightIcon.svg";
import InfoCard from "components/common/InfoCard";

const CarouselCards = ({ moreNft }: any) => {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    cssEase: "linear",
    nextArrow: <ArrowRightIcon />,
    prevArrow: <ArrowLeftIcon />,
    responsive: [
      {
        breakpoint: 1250,
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
    <Box className={`${Classes.carouselCardsWrapper} carousel-with-arrows`}>
      <Typography component="h4" className={Classes.title}>
        More From This Collection
      </Typography>
      <Slider {...settings}>
        {moreNft.map((card: any, index: string) => (
          <InfoCard
            key={index}
            auctionData={{
              ...card?.activeAuction,
              nftId: card.nftDetail,
              userId: card?.userDetail,
            }}
            data={{ ...card }}
            className={Classes.cardItem}
          />
        ))}
      </Slider>
    </Box>
  );
};

export default CarouselCards;
