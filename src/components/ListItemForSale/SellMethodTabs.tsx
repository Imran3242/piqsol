import React from "react";
import { Box, Typography, Button } from "@mui/material";
import Classes from "../../style/ListItemForSale/SellMethodTabs.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import SellMethodTabsContent from "./SellMethodTabsContent";
import FractionalGrayImg from "../../assets/images/fractional-gray.png";
import { ReactComponent as BidBag } from "../../assets/icons/SVG/BidBag.svg";

const SellMethodTabs = ({
  royaltyFee,
  timeDurationValue,
  setSelectedDateTime,
  selectedBlockchain,
  selectedDateTime,
  setSelectedBlockchain,
  nftPrice,
  setPrice,
  nftPriceInUSD,
  setnftPriceInUSD,
  displayStreaming,
  setDisplayStreaming,
  setCreatorNftRights,
  creatorNftRights,
  physicalReproduction,
  setPhysicalReproduction,
  termsAndCondition,
  setTermsAndCondition,
  setAuctionType,
  blockSize,
  setBlockSize,
  perBlockPrice,
  setPerBlockPrice,
  currentTab,
  nftData,
}: any) => {
  const [tabValue, setTabValue] = React.useState("fixedPrice");

  React.useEffect(() => {
    currentTab(tabValue);
  }, [tabValue]);

  return (
    <Box className={Classes.sellMathodTabsWrapper}>
      <Typography component="h4" className={Classes.tabsTitle}>
        Select your NFT sell method
      </Typography>
      <Typography component="div" className={Classes.tabsButtonWrapper}>
        <Button
          onClick={() => {
            setTabValue("fixedPrice");
            setAuctionType("fixedPrice");
            setnftPriceInUSD(nftPriceInUSD);
          }}
          className={`${Classes.tabItem} ${
            tabValue === "fixedPrice" ? Classes.activeTab : ""
          }`}
        >
          <Typography component="div">
            <Typography component="div">
              <FontAwesomeIcon className={Classes.icon} icon={faDollarSign} />{" "}
              <span className={Classes.heading}>Fixed Price</span>
            </Typography>
            <Typography component="span" className={Classes.description}>
              Sell at a fixed price
            </Typography>
          </Typography>
        </Button>
        <Button
          onClick={() => {
            setTabValue("highestBid");
            setnftPriceInUSD(0);
            setAuctionType("highestBid");
          }}
          className={`${Classes.tabItem} ${
            tabValue === "highestBid" ? Classes.activeTab : ""
          }`}
        >
          <Typography component="div">
            <Typography
              component="div"
              sx={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <BidBag />
              <span className={Classes.heading}>Highest Bid</span>
            </Typography>
            <Typography component="span" className={Classes.description}>
              Auction to the highest bidder
            </Typography>
          </Typography>
        </Button>
        {nftData?.nftType !== "Fraction" &&
          nftData?.properties?.category === "image" && (
            <Button
              onClick={() => {
                setTabValue("fractional");
                setnftPriceInUSD(0);
                setAuctionType("fractional");
              }}
              className={`${Classes.tabItem} ${
                tabValue === "fractional" ? Classes.activeTab : ""
              }`}
            >
              <Typography component="div">
                <Typography
                  component="div"
                  sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  {tabValue === "fractional" ? (
                    <img
                      loading="lazy"
                      src={FractionalGrayImg}
                      alt="fractional icon"
                      style={{ height: "19px", width: "19px" }}
                    />
                  ) : (
                    <span className={Classes.fractionalTabIcon}></span>
                  )}
                  <span className={Classes.heading}>Fractional</span>
                </Typography>
                <Typography component="span" className={Classes.description}>
                  Sell your art in multiple blocks
                </Typography>
              </Typography>
            </Button>
          )}
      </Typography>

      <Box>
        <SellMethodTabsContent
          royaltyFee={royaltyFee}
          timeDurationValue={timeDurationValue}
          setSelectedDateTime={setSelectedDateTime}
          selectedBlockchain={selectedBlockchain}
          setSelectedBlockchain={setSelectedBlockchain}
          nftPrice={nftPrice}
          nftPriceInUSD={nftPriceInUSD}
          setPrice={setPrice}
          selectedDateTime={selectedDateTime}
          displayStreaming={displayStreaming}
          creatorNftRights={creatorNftRights}
          setCreatorNftRights={setCreatorNftRights}
          setDisplayStreaming={setDisplayStreaming}
          physicalReproduction={physicalReproduction}
          setPhysicalReproduction={setPhysicalReproduction}
          termsAndCondition={termsAndCondition}
          setTermsAndCondition={setTermsAndCondition}
          tabName={tabValue}
          blockSize={blockSize}
          setBlockSize={setBlockSize}
          perBlockPrice={perBlockPrice}
          nftData={nftData}
          setPerBlockPrice={setPerBlockPrice}
        />
      </Box>
    </Box>
  );
};

export default SellMethodTabs;
