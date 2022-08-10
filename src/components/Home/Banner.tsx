import * as React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";
import HomeBanner from "../../assets/images/HomeBanner.png";
import StreamlineArrowRight from "../../assets/icons/streamline-icon-arrow-corner-right.svg";
import BestNFT from "../../assets/icons/Best-Nft.svg";
import Emilie from "../../assets/icons/Emilie.png";
import Good from "../../assets/icons/good.png";
import { AnimationOnScroll } from "react-animation-on-scroll";

import Classes from "../../style/home/Banner.module.scss";

const Banner = () => {
  const [loadCard, setLoadCard] = React.useState<boolean>(false);

  return (
    <div className={`${Classes.bannerMain}`}>
      <Container>
        <Box sx={{ flexGrow: 1, display: "flex", gap: "30px" }}>
          <Box className={Classes.homeBanner}>
            <AnimationOnScroll animateOnce={true} animateIn="animate__zoomIn">
              <Box className={Classes.bannerSection}>
                <div>
                  <div className={Classes.leftContent}>
                    <Typography variant="h3">
                      <span className={Classes.fontLarge}>Oh Yeah Baby!</span>{" "}
                      <br></br> Buy, Sell & Create <br></br>
                      Super <span> Rare NFTs </span> <br></br>
                    </Typography>
                    <Typography className={Classes.description}>
                      On the world's first and only realtime<br></br>{" "}
                      <b>Fractional Multichain NFT Marketplace</b>
                    </Typography>
                    <Box className={Classes.btnWrapper}>
                      <Link to="/explore">
                        <Button
                          variant="contained"
                          size="medium"
                          className={
                            Classes.bannerButton + " " + Classes.exploreButton
                          }
                        >
                          Explore Now
                        </Button>
                      </Link>
                      <Link to="/create-collection">
                        <Button
                          variant="contained"
                          endIcon={
                            <img
                              loading="lazy"
                              src={StreamlineArrowRight}
                              alt="StreamlineArrowRight"
                            />
                          }
                          className={
                            Classes.bannerButton +
                            " " +
                            Classes.getStartedButton
                          }
                        >
                          Get Started
                        </Button>
                      </Link>
                    </Box>
                    <Box className={Classes.bestNft}>
                      <img loading="lazy" src={BestNFT} alt="BestNFT" />
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography className={Classes.hundred}>
                          100+
                        </Typography>
                        <Typography> The Best NFT Creators</Typography>
                      </Box>
                    </Box>
                  </div>
                </div>
                <div className={Classes.rightContent}>
                  <div className={Classes.rightImage}>
                    <img
                      loading="lazy"
                      src={HomeBanner}
                      alt="Home Banner"
                      onLoad={() => {
                        setLoadCard(true);
                      }}
                    />

                    {loadCard && (
                      <Box className={Classes.cards}>
                        <div className={Classes.firstCard}>
                          <img loading="lazy" src={Emilie} alt="Emilie" />
                          <Typography>Emilie Gutierrez</Typography>
                          <img loading="lazy" src={Good} alt="good" />
                        </div>
                        <div className={Classes.secondCard}>
                          <Box sx={{ display: "flex", gap: "25px" }}>
                            <Box>
                              <Typography>TOTAL OFFERS</Typography>
                              <Typography>45</Typography>
                            </Box>
                            <Box>
                              <Typography>TOTAL VIEWS</Typography>
                              <Typography>23</Typography>
                            </Box>
                            <Box>
                              <Typography>CURRENT PRICE</Typography>
                              <Typography>20.85 SOL</Typography>
                            </Box>
                          </Box>
                        </div>
                      </Box>
                    )}
                  </div>
                </div>
              </Box>
            </AnimationOnScroll>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Banner;
