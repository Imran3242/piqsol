import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Classes from "../../style/ListItemForSale/ListItemForSale.module.scss";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import InfoCard from "../../components/common/InfoCard";
import SellMethodTabs from "../../components/ListItemForSale/SellMethodTabs";

import { getNftDetails } from "store/reducers/nftReducer";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import getTimeDuration from "utils/helpers/getTimeDuration";
import { solToUSD } from "utils/helpers/solToDollarsPrice";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { extractErrorMessage } from "components/common/helpers/helpers";

const ListItemForSale = (props: any) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params: any = useParams();

  const currentUser = useSelector(
    (state: any) => state.authReducer.currentUser
  );
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );
  const [nftPrice, setPrice] = useState<number>(0.01);
  const [nftPriceInUSD, setnftPriceInUSD] = useState<number>(0);
  const [auctionType, setAuctionType] = useState<string>("fixedPrice");
  const [nftData, setNftData] = useState<any>();
  const [selectedDateTime, setSelectedDateTime] = useState<Date>();

  const [selectedBlockchain, setSelectedBlockchain] = useState<string>(
    currentUser?.chainType
  );

  const [secondsDuration, setSecondDuration] = useState<number>(0);

  const [blockSize, setBlockSize] = useState<number>(0);

  const [perBlockPrice, setPerBlockPrice] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("fixedPrice");
  const [displayStreaming, setDisplayStreaming] = useState<any>({
    piqsolEcosystem: true,
    privatePurposes: false,
    commercialPurposes: false,
  });

  const [physicalReproduction, setPhysicalReproduction] = useState<any>({
    noReproduction: true,
    privatePurposes: false,
    oneCommercialPurposes: false,
    multipleCommercialPurposes: false,
  });

  const [creatorNftRights, setCreatorNftRights] = useState<any>({
    publicDisplayOrStreamArtWork: false,
    digitalReproduction: false,
    physicalReproductionRights: false,
    digitalCommercialization: false,
  });
  const [termsAndCondition, setTermsAndCondition] = useState<boolean>(true);

  const getNftDetailFunc = async () => {
    const nftData: any = await dispatch(getNftDetails(params?.id || ""));
    setNftData(nftData);
  };

  useEffect(() => {
    if (nftData?.displayStreaming) {
      setDisplayStreaming(nftData?.displayStreaming);
    }
    if (nftData?.creatorNftRights) {
      setCreatorNftRights(nftData?.creatorNftRights);
    }
    if (nftData?.physicalReproduction) {
      setPhysicalReproduction(nftData?.physicalReproduction);
    }
  }, [nftData?._id]);

  const timeDurationValue = useMemo(() => {
    if (selectedDateTime) {
      const { value, seconds }: any = getTimeDuration(
        selectedDateTime,
        new Date()
      );
      setSecondDuration(seconds);
      return value;
    }
  }, [selectedDateTime]);

  useEffect(() => {
    getNftDetailFunc();
  }, []);

  const solPriceToUSDConversion = async (price) => {
    const usdPrice = await solToUSD(
      price,
      nftData?.blockchainType?.toLowerCase()
    );
    setnftPriceInUSD(usdPrice);
  };

  useEffect(() => {
    solPriceToUSDConversion(nftPrice);
  }, [nftPrice, currentTab]);

  useEffect(() => {
    if (currentTab === "fractional") {
      setBlockSize(0);
      solPriceToUSDConversion(perBlockPrice);
    }
  }, [currentTab]);

  const getPriceForAuction = () => {
    if (auctionType === "fractional") {
      const price = parseFloat(perBlockPrice) * blockSize;

      return price;
    }
    return nftPrice;
  };

  const getPriceForAuctionInUSD = () => {
    if (auctionType === "fractional") {
      return blockSize * nftPriceInUSD;
    }
    return nftPriceInUSD;
  };

  return (
    <Container>
      {nftData && (
        <>
          <Box className={Classes.ListItemForSaleWrapper}>
            <Button
              className={Classes.goBackBtn}
              startIcon={
                <KeyboardArrowLeftOutlinedIcon className={Classes.backIcon} />
              }
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Typography component="h4" className={Classes.pageTitle}>
              List item for sell
            </Typography>
            <Grid container spacing={4}>
              <Grid item md={3}>
                <InfoCard
                  showBottomInfo={false}
                  showBadges={false}
                  data={nftData}
                />
              </Grid>
              <Grid item md={9}>
                <SellMethodTabs
                  setAuctionType={setAuctionType}
                  timeDurationValue={timeDurationValue}
                  royaltyFee={Number(nftData.seller_fee_basis_points) / 100}
                  setSelectedDateTime={setSelectedDateTime}
                  selectedBlockchain={currentUser?.chainType}
                  setSelectedBlockchain={setSelectedBlockchain}
                  nftPrice={nftPrice}
                  setPrice={setPrice}
                  nftPriceInUSD={nftPriceInUSD}
                  setnftPriceInUSD={setnftPriceInUSD}
                  selectedDateTime={selectedDateTime}
                  displayStreaming={displayStreaming}
                  creatorNftRights={creatorNftRights}
                  setCreatorNftRights={setCreatorNftRights}
                  setDisplayStreaming={setDisplayStreaming}
                  physicalReproduction={physicalReproduction}
                  setPhysicalReproduction={setPhysicalReproduction}
                  termsAndCondition={termsAndCondition}
                  setTermsAndCondition={setTermsAndCondition}
                  blockSize={blockSize}
                  setBlockSize={setBlockSize}
                  perBlockPrice={perBlockPrice}
                  setPerBlockPrice={setPerBlockPrice}
                  nftData={nftData}
                  currentTab={(val: string) => {
                    setCurrentTab(val);
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ marginBottom: "20px" }} />
          <Typography sx={{ textAlign: "end" }}>
            <Button
              variant="contained"
              className={`gradientButton ${Classes.actionBtn}`}
              onClick={() => {
                try {
                  if (!termsAndCondition) {
                    dispatch(setMessage("Please accept terms and conditions"));
                    dispatch(setIsOpen(true));
                    dispatch(setIsSuccess(false));
                    return;
                  }

                  if (nftPrice <= 0) {
                    dispatch(
                      setMessage("Please set some price to list your NFT")
                    );
                    dispatch(setIsOpen(true));
                    dispatch(setIsSuccess(false));
                    return;
                  }

                  if (
                    !selectedDateTime &&
                    secondsDuration <= 0 &&
                    auctionType === "highestBid"
                  ) {
                    dispatch(
                      setMessage("Please set specific time to list your NFT")
                    );
                    dispatch(setIsOpen(true));
                    dispatch(setIsSuccess(false));
                    return;
                  }

                  if (
                    auctionType === "fractional" &&
                    (perBlockPrice === "" || Number(perBlockPrice) <= 0)
                  ) {
                    dispatch(setMessage("Please add per block price"));
                    dispatch(setIsOpen(true));
                    dispatch(setIsSuccess(false));

                    return;
                  }
                  if (auctionType === "fractional" && blockSize === 0) {
                    dispatch(setMessage("Please select blocks"));
                    dispatch(setIsOpen(true));
                    dispatch(setIsSuccess(false));

                    return;
                  }
                  const auctionData = {
                    auctionType: auctionType,
                    nftData: nftData,
                    royaltyFee: Number(nftData.seller_fee_basis_points) / 100,
                    secondsDuration: secondsDuration,
                    selectedDateTime: selectedDateTime,
                    nftPrice: getPriceForAuction(),
                    selectedBlockchain: selectedBlockchain,
                    displayStreaming: displayStreaming,
                    creatorNftRights: creatorNftRights,
                    physicalReproduction: physicalReproduction,
                    perBlockPrice: perBlockPrice,
                    blockSize: blockSize,
                    nftPriceInUSD: getPriceForAuctionInUSD(),
                    currentTab: currentTab,
                  };
                  localStorage.setItem(
                    "auctionCreateData",
                    JSON.stringify(auctionData)
                  );
                  navigate("/nft-summary");
                } catch (err) {
                  dispatch(
                    setMessage(
                      "There is something wrong please try again later" +
                        extractErrorMessage(err)
                    )
                  );
                  dispatch(setIsOpen(true));
                  dispatch(setIsSuccess(false));
                } finally {
                }
              }}
            >
              {"Next"}
            </Button>
          </Typography>
        </>
      )}
    </Container>
  );
};

export default ListItemForSale;
