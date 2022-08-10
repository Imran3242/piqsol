import React from "react";
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { styled } from "@mui/system";
import SwitchUnstyled, {
  switchUnstyledClasses,
} from "@mui/base/SwitchUnstyled";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Classes from "../../style/ListItemForSale/SellMethodTabs.module.scss";
import CustomSelectStyles from "../../style/Common/CustomSelect.module.scss";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InputUnstyled from "@mui/base/InputUnstyled";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SolanaLogo from "../../assets/images/sol-logo.png";
import CheckIcon from "@mui/icons-material/Check";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";
import {
  CHAIN_CURRENCY,
  CHAIN_LOGOS,
  CHAIN_TITLE,
  setPriceUptoThreeDecimal,
} from "components/common/helpers/helpers";

const useStyles = makeStyles({
  root: {
    "& .MuiSvgIcon-root": {
      color: "var(--text-color)",
    },
  },
});

const CustomMarkIcon = () => {
  return (
    <Typography
      sx={{
        background: "#43F195",
        height: "14px",
        width: "14px",
        borderRadius: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CheckIcon sx={{ fontSize: "13px !important" }} />
    </Typography>
  );
};

const CustomUnMarkIcon = () => {
  return (
    <Typography
      sx={{
        height: "14px",
        width: "14px",
        borderRadius: "2px",
        border: "1px solid #979797",
      }}
    ></Typography>
  );
};

const grey = {
  400: "#BFC7CF",
  500: "#AAB4BE",
  600: "#6F7E8C",
};
const Root = styled("span")(
  ({ theme }) => `
	font-size: 0;
	position: relative;
	display: inline-block;
	width: 40px;
	height: 20px;
	margin: 10px;
	cursor: pointer;

	&.${switchUnstyledClasses.disabled} {
		opacity: 0.4;
		cursor: not-allowed;
	}

	& .${switchUnstyledClasses.track} {
		background: ${theme.palette.mode === "dark" ? grey[600] : grey[400]};
		border-radius: 10px;
		display: block;
		height: 100%;
		width: 100%;
		position: absolute;
	}

	& .${switchUnstyledClasses.thumb} {
		display: block;
		width: 14px;
		height: 14px;
		top: 3px;
		left: 3px;
		border-radius: 16px;
		background-color: #fff;
		position: relative;
		transition: all 200ms ease;
	}

	&.${switchUnstyledClasses.focusVisible} .${switchUnstyledClasses.thumb} {
		background-color: #43F195;
		box-shadow: 0 0 1px 8px rgba(0, 0, 0, 0.25);
	}

	&.${switchUnstyledClasses.checked} {
		.${switchUnstyledClasses.thumb} {
			left: 22px;
			top: 3px;
			background-color: #fff;
		}

		.${switchUnstyledClasses.track} {
			background: #43F195;
		}
	}

	& .${switchUnstyledClasses.input} {
		cursor: inherit;
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		opacity: 0;
		z-index: 1;
		margin: 0;
	}
	`
);

const SellMethodTabsContent = (props: any) => {
  const {
    tabName,
    timeDurationValue,
    setSelectedDateTime,
    selectedBlockchain,
    setSelectedBlockchain,
    nftPrice,
    setPrice,
    nftPriceInUSD,
    displayStreaming,
    setDisplayStreaming,
    physicalReproduction,
    creatorNftRights,
    setCreatorNftRights,
    setPhysicalReproduction,
    termsAndCondition,
    setTermsAndCondition,
    royaltyFee,
    blockSize,
    setBlockSize,
    perBlockPrice,
    setPerBlockPrice,
    nftData,
  }: any = props;

  const [blockChain, setBlockChain] = React.useState("");
  const [ownerRights, setOwnerRights] = React.useState("");
  const [active, setActive] = React.useState(0);
  const customStyles = useStyles();

  const [value, setValue] = React.useState<Date | null>(new Date());

  const label = { componentsProps: { input: { "aria-label": "Demo switch" } } };
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );
  return (
    <Box component="form" className={customStyles.root}>
      {tabName === "fixedPrice" && (
        <Grid container spacing={3}>
          <Grid item md={6}>
            <Typography component="div">
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Selected blockchain
              </InputLabel>
              <FormControl sx={{ minWidth: "100%" }}>
                <Typography
                  component="div"
                  className={Classes.borderedItem}
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <img
                    loading="lazy"
                    src={CHAIN_LOGOS[selectedBlockchain]}
                    style={{
                      height: "25px",
                      width: "25px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    alt="solana logo"
                  />
                  <Typography
                    component="span"
                    className={CustomSelectStyles.menuItemText}
                  >
                    {CHAIN_TITLE[selectedBlockchain]}
                  </Typography>
                </Typography>
              </FormControl>
            </Typography>
            <Typography component="div" sx={{ marginTop: "20px" }}>
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Royalty fee
              </InputLabel>
              <Typography
                component="div"
                className={Classes.borderedItem}
                sx={{ height: "53px", display: "fex", alignItems: "center" }}
              >
                <InputUnstyled
                  value={`${royaltyFee}%`}
                  className={Classes.customInput}
                />
              </Typography>
            </Typography>
          </Grid>
          <Grid item md={6}>
            <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
              Price
            </InputLabel>
            <Typography
              component="div"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              className={Classes.borderedItem}
            >
              <Typography
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Button
                  component="span"
                  sx={{ gap: "5px" }}
                  className={Classes.solBtn}
                >
                  <img
                    loading="lazy"
                    src={CHAIN_LOGOS[selectedBlockchain]}
                    alt="SolanaLogo"
                    style={{ height: "20px", width: "20px" }}
                  />
                  <span>{CHAIN_CURRENCY[selectedBlockchain]}</span>
                </Button>
                <Typography component="span" className={Classes.price}>
                  <InputUnstyled
                    onChange={(e) =>
                      setPriceUptoThreeDecimal(e.target.value, setPrice)
                    }
                    value={nftPrice}
                    className={Classes.customInput}
                  />
                </Typography>
              </Typography>
              <Typography component="span" className={Classes.priceCount}>
                {`$${nftPriceInUSD.toFixed(4)}`}
              </Typography>
            </Typography>
          </Grid>
        </Grid>
      )}

      {tabName === "highestBid" && (
        <Grid container spacing={3}>
          <Grid item md={6}>
            <Typography component="div">
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Selected blockchain
              </InputLabel>
              <FormControl sx={{ minWidth: "100%" }}>
                <Typography
                  component="div"
                  className={Classes.borderedItem}
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <img
                    loading="lazy"
                    src={CHAIN_LOGOS[selectedBlockchain]}
                    style={{
                      height: "25px",
                      width: "25px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    alt="solana logo"
                  />
                  <Typography
                    component="span"
                    className={CustomSelectStyles.menuItemText}
                  >
                    {CHAIN_TITLE[selectedBlockchain]}
                  </Typography>
                </Typography>
              </FormControl>
            </Typography>

            <Typography component="div" sx={{ marginTop: "20px" }}>
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Royalty fee
              </InputLabel>
              <Typography
                component="div"
                className={Classes.borderedItem}
                sx={{ height: "53px", display: "fex", alignItems: "center" }}
              >
                <InputUnstyled
                  value={`${royaltyFee}%`}
                  className={Classes.customInput}
                />
              </Typography>
            </Typography>
          </Grid>
          <Grid item md={6}>
            <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
              Min Bid
            </InputLabel>
            <Typography
              component="div"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              className={Classes.borderedItem}
            >
              <Typography
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Button
                  component="span"
                  sx={{ gap: "5px" }}
                  className={Classes.solBtn}
                >
                  <img
                    loading="lazy"
                    src={CHAIN_LOGOS[selectedBlockchain]}
                    alt="SolanaLogo"
                    style={{ height: "20px", width: "20px" }}
                  />
                  <span>{CHAIN_CURRENCY[selectedBlockchain]}</span>
                </Button>
                <Typography component="span" className={Classes.price}>
                  <InputUnstyled
                    onChange={(e) =>
                      setPriceUptoThreeDecimal(e.target.value, setPrice)
                    }
                    value={nftPrice}
                    type="number"
                    className={Classes.customInput}
                  />
                </Typography>
              </Typography>
              <Typography component="span" className={Classes.priceCount}>
                {`$${nftPriceInUSD.toFixed(4)}`}
              </Typography>
            </Typography>

            <Typography component="div" sx={{ marginTop: "20px" }}>
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Duration
              </InputLabel>
              <Typography
                component="div"
                className={Classes.borderedItem}
                sx={{
                  height: "53px",
                  display: "fex",
                  alignItems: "center",
                  paddingLeft: "0 !important",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Custom input"
                    value={timeDurationValue}
                    minDateTime={new Date()}
                    onChange={(newValue) => {
                      setSelectedDateTime(newValue);
                    }}
                    renderInput={({ inputRef, inputProps, InputProps }) => {
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {InputProps?.endAdornment}
                          <input
                            className={Classes.datePicker}
                            ref={inputRef}
                            {...inputProps}
                            value={timeDurationValue}
                            readOnly={true}
                          />
                        </Box>
                      );
                    }}
                  />
                </LocalizationProvider>
              </Typography>
            </Typography>
          </Grid>
        </Grid>
      )}

      {tabName === "fractional" && (
        <Grid container spacing={3}>
          <Grid item>
            <Typography component="div">
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Select Blocks
              </InputLabel>
              <Typography
                component="div"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                className={Classes.borderedItem}
              >
                <Typography component="div">
                  {systemSetting?.franctionValues?.map(
                    (block: any, index: any) => (
                      <Button
                        onClick={() => {
                          setBlockSize(parseInt(block));
                          setActive(index + 1);
                        }}
                        component="span"
                        sx={{ marginBottom: "5px" }}
                        className={`${
                          active == index + 1 &&
                          block === blockSize &&
                          Classes.active
                        } ${Classes.solBtn}`}
                      >
                        <span>{block} Blocks</span>
                      </Button>
                    )
                  )}
                </Typography>
              </Typography>
            </Typography>

            <Typography component="div" sx={{ marginTop: "20px" }}>
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Per Block Price
              </InputLabel>
              <Typography
                component="div"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                className={Classes.borderedItem}
              >
                <Typography
                  component="div"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Button
                    component="span"
                    sx={{ gap: "5px" }}
                    className={Classes.solBtn}
                  >
                    <img
                      loading="lazy"
                      src={CHAIN_LOGOS[selectedBlockchain]}
                      alt="SolanaLogo"
                      style={{ height: "20px", width: "20px" }}
                    />
                    <span>{CHAIN_CURRENCY[selectedBlockchain]}</span>
                  </Button>
                  <Typography component="span" className={Classes.price}>
                    <InputUnstyled
                      onChange={(e) =>
                        setPriceUptoThreeDecimal(
                          e.target.value,
                          setPerBlockPrice
                        )
                      }
                      value={perBlockPrice}
                      className={Classes.customInput}
                      type={"number"}
                    />
                  </Typography>
                </Typography>
                <Typography component="span" className={Classes.priceCount}>
                  {`$${nftPriceInUSD.toFixed(4)}`}
                </Typography>
              </Typography>
            </Typography>
          </Grid>
          <Grid item md={6}>
            <Typography component="div">
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Selected blockchain
              </InputLabel>
              <FormControl sx={{ minWidth: "100%" }}>
                <Typography
                  component="div"
                  className={Classes.borderedItem}
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <img
                    loading="lazy"
                    src={CHAIN_LOGOS[selectedBlockchain]}
                    style={{
                      height: "25px",
                      width: "25px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    alt="solana logo"
                  />
                  <Typography
                    component="span"
                    className={CustomSelectStyles.menuItemText}
                  >
                    {CHAIN_TITLE[selectedBlockchain]}
                  </Typography>
                </Typography>
              </FormControl>
            </Typography>
            <Typography component="div" sx={{ marginTop: "20px" }}>
              <InputLabel htmlFor="blockchain" className={Classes.inputLabel}>
                Royalty fee
              </InputLabel>
              <Typography
                component="div"
                className={Classes.borderedItem}
                sx={{ height: "53px", display: "fex", alignItems: "center" }}
              >
                <InputUnstyled
                  value={`${royaltyFee}%`}
                  className={Classes.customInput}
                />
              </Typography>
            </Typography>
          </Grid>
        </Grid>
      )}

      <Box className={Classes.sectionItem} sx={{ marginTop: "30px" }}>
        <Box className={Classes.sectionItem} sx={{ marginTop: "20px" }}>
          <Typography
            component="h4"
            className={Classes.title}
            style={{
              display:
                nftData?.creatorNftRights?.publicDisplayOrStreamArtWork ===
                  false &&
                nftData?.creatorNftRights?.digitalReproduction === false &&
                nftData?.creatorNftRights?.physicalReproductionRights ===
                  false &&
                nftData?.creatorNftRights?.digitalCommercialization === false &&
                (nftData?.activeAuction === null ||
                  nftData?.activeAuction?.status !== "end")
                  ? "none"
                  : "block",
            }}
          >
            The Creator of this NFT confirms to have the following rights:
          </Typography>
          <FormGroup
            style={{
              display:
                nftData?.creatorNftRights?.publicDisplayOrStreamArtWork ===
                  false &&
                (nftData?.activeAuction === null ||
                  nftData?.activeAuction?.status !== "end")
                  ? "none"
                  : "block",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  disabled={nftData?.creatorNftRights}
                  checked={creatorNftRights?.publicDisplayOrStreamArtWork}
                  onChange={(e) =>
                    setCreatorNftRights({
                      ...creatorNftRights,
                      publicDisplayOrStreamArtWork: e.target.checked,
                    })
                  }
                  icon={<CustomUnMarkIcon />}
                  checkedIcon={<CustomMarkIcon />}
                />
              }
              label={
                <Typography className={Classes.checkboxLabel}>
                  I confirm to own/have expressly obtained from the creator of
                  the artworks the copyrights necessary for the Public display
                  and/or streaming of the NFT associated artworks.
                </Typography>
              }
            />
          </FormGroup>
          <FormGroup
            style={{
              display:
                nftData?.creatorNftRights?.digitalReproduction === false &&
                (nftData?.activeAuction === null ||
                  nftData?.activeAuction?.status !== "end")
                  ? "none"
                  : "block",
            }}
          >
            <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={creatorNftRights?.digitalReproduction}
                  disabled={nftData?.creatorNftRights}
                  onChange={(e) =>
                    setCreatorNftRights({
                      ...creatorNftRights,
                      digitalReproduction: e.target.checked,
                    })
                  }
                  icon={<CustomUnMarkIcon />}
                  checkedIcon={<CustomMarkIcon />}
                />
              }
              label={
                <Typography className={Classes.checkboxLabel}>
                  I confirm to be the artist/creator of the selected artwork(s)
                  and/or to own/have expressly obtained from the creator the
                  copyrights necessary for the digital reproduction of the
                  selected artworks and their display within the PIQSOL
                  ecosystem.
                </Typography>
              }
            />
          </FormGroup>
          <FormGroup
            style={{
              display:
                nftData?.creatorNftRights?.physicalReproductionRights ===
                  false &&
                (nftData?.activeAuction === null ||
                  nftData?.activeAuction?.status !== "end")
                  ? "none"
                  : "block",
            }}
          >
            <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={creatorNftRights?.physicalReproductionRights}
                  disabled={nftData?.creatorNftRights}
                  onChange={(e) =>
                    setCreatorNftRights({
                      ...creatorNftRights,
                      physicalReproductionRights: e.target.checked,
                    })
                  }
                  icon={<CustomUnMarkIcon />}
                  checkedIcon={<CustomMarkIcon />}
                />
              }
              label={
                <Typography className={Classes.checkboxLabel}>
                  I confirm that I own the physical reproduction rights for all
                  of the selected artwork(s).
                </Typography>
              }
            />
          </FormGroup>
          <FormGroup
            style={{
              display:
                nftData?.creatorNftRights?.digitalCommercialization === false &&
                (nftData?.activeAuction === null ||
                  nftData?.activeAuction?.status !== "end")
                  ? "none"
                  : "block",
            }}
          >
            <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={creatorNftRights?.digitalCommercialization}
                  disabled={nftData?.creatorNftRights}
                  onChange={(e) =>
                    setCreatorNftRights({
                      ...creatorNftRights,
                      digitalCommercialization: e.target.checked,
                    })
                  }
                  icon={<CustomUnMarkIcon />}
                  checkedIcon={<CustomMarkIcon />}
                />
              }
              label={
                <Typography className={Classes.checkboxLabel}>
                  I confirm to own the digital commercialization rights for the
                  selected artwork(s).
                </Typography>
              }
            />
          </FormGroup>
        </Box>

        <Typography
          component="h4"
          className={Classes.title}
          style={{
            display:
              nftData?.displayStreaming?.piqsolEcosystem === false &&
              nftData?.displayStreaming?.privatePurposes === false &&
              nftData?.displayStreaming?.commercialPurposes === false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          Display / Streaming
        </Typography>
        <FormGroup
          style={{
            display:
              nftData?.displayStreaming &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                disabled={nftData?.displayStreaming}
                checked={displayStreaming.noDisplayStream}
                onChange={(e) =>
                  setDisplayStreaming({
                    ...displayStreaming,
                    noDisplayStream: e.target.checked,
                    piqsolEcosystem: false,
                    privatePurposes: false,
                    commercialPurposes: false,
                  })
                }
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                No Display/streaming allowed.
              </Typography>
            }
          />
        </FormGroup>

        <FormGroup
          style={{
            display:
              nftData?.displayStreaming?.piqsolEcosystem === false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
          <FormControlLabel
            control={
              <Checkbox
                disabled={
                  nftData?.displayStreaming || displayStreaming?.noDisplayStream
                }
                checked={displayStreaming.piqsolEcosystem}
                onChange={(e) =>
                  setDisplayStreaming({
                    ...displayStreaming,
                    piqsolEcosystem: e.target.checked,
                  })
                }
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                Stream the associated artwork(s) on the piqsol ecosystem
              </Typography>
            }
          />
        </FormGroup>
        <FormGroup
          style={{
            display:
              nftData?.displayStreaming?.privatePurposes === false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
          <FormControlLabel
            control={
              <Checkbox
                checked={displayStreaming.privatePurposes}
                disabled={
                  nftData?.displayStreaming || displayStreaming?.noDisplayStream
                }
                onChange={(e) =>
                  setDisplayStreaming({
                    ...displayStreaming,
                    privatePurposes: e.target.checked,
                  })
                }
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                Stream the associated artwork(s) anywhere for private purposes.
              </Typography>
            }
          />
        </FormGroup>
        <FormGroup
          style={{
            display:
              nftData?.displayStreaming?.commercialPurposes === false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
          <FormControlLabel
            control={
              <Checkbox
                disabled={
                  nftData?.displayStreaming || displayStreaming?.noDisplayStream
                }
                checked={displayStreaming.commercialPurposes}
                onChange={(e) =>
                  setDisplayStreaming({
                    ...displayStreaming,
                    commercialPurposes: e.target.checked,
                  })
                }
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                Stream the associated artwork(s) anywhere for commercial
                purposes.
              </Typography>
            }
          />
        </FormGroup>
      </Box>
      <Box className={Classes.sectionItem} sx={{ marginTop: "20px" }}>
        <Typography
          component="h4"
          className={Classes.title}
          style={{
            display:
              nftData?.physicalReproduction?.noReproduction === false &&
              nftData?.physicalReproduction?.privatePurposes === false &&
              nftData?.physicalReproduction?.oneCommercialPurposes === false &&
              nftData?.physicalReproduction?.multipleCommercialPurposes ===
                false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          Physical Reproduction
        </Typography>
        <FormGroup
          style={{
            display:
              nftData?.physicalReproduction?.noReproduction === false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                onChange={(e) =>
                  setPhysicalReproduction({
                    ...physicalReproduction,
                    noReproduction: e.target.checked,
                    privatePurposes: false,
                    oneCommercialPurposes: false,
                    multipleCommercialPurposes: false,
                  })
                }
                disabled={nftData?.physicalReproduction}
                checked={physicalReproduction?.noReproduction}
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                No physical reproductions.
              </Typography>
            }
          />
        </FormGroup>
        <FormGroup
          style={{
            display:
              nftData?.physicalReproduction?.privatePurposes === false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
          <FormControlLabel
            control={
              <Checkbox
                disabled={
                  nftData?.physicalReproduction ||
                  physicalReproduction?.noReproduction
                }
                checked={physicalReproduction?.privatePurposes}
                onChange={(e) =>
                  setPhysicalReproduction({
                    ...physicalReproduction,
                    privatePurposes: e.target.checked,
                  })
                }
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                Create physical reproductions for private purpose.
              </Typography>
            }
          />
        </FormGroup>
        <FormGroup
          style={{
            display:
              nftData?.physicalReproduction?.oneCommercialPurposes === false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
          <FormControlLabel
            control={
              <Checkbox
                disabled={
                  nftData?.physicalReproduction ||
                  physicalReproduction?.noReproduction
                }
                checked={physicalReproduction?.oneCommercialPurposes}
                onChange={(e) =>
                  setPhysicalReproduction({
                    ...physicalReproduction,
                    oneCommercialPurposes: e.target.checked,
                  })
                }
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                Create one physical reproduction for commercial purposes.
              </Typography>
            }
          />
        </FormGroup>
        <FormGroup
          style={{
            display:
              nftData?.physicalReproduction?.multipleCommercialPurposes ===
                false &&
              (nftData?.activeAuction === null ||
                nftData?.activeAuction?.status !== "end")
                ? "none"
                : "block",
          }}
        >
          <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
          <FormControlLabel
            control={
              <Checkbox
                disabled={
                  nftData?.physicalReproduction ||
                  physicalReproduction?.noReproduction
                }
                checked={physicalReproduction?.multipleCommercialPurposes}
                onChange={(e) =>
                  setPhysicalReproduction({
                    ...physicalReproduction,
                    multipleCommercialPurposes: e.target.checked,
                  })
                }
                icon={<CustomUnMarkIcon />}
                checkedIcon={<CustomMarkIcon />}
              />
            }
            label={
              <Typography className={Classes.checkboxLabel}>
                Create multiple physical reproduction for commercial purposes.
              </Typography>
            }
          />
        </FormGroup>
      </Box>

      <Box className={Classes.sectionItem} sx={{ marginTop: "20px" }}>
        <Divider sx={{ marginTop: "20px", marginBottom: "10px" }} />
      </Box>
      <Box className={Classes.sectionItem} sx={{ marginTop: "20px" }}>
        <Typography component="div">
          <Typography component="h4" className={Classes.title}>
            Fees
          </Typography>
          <Typography
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <Typography
              component="p"
              sx={{
                color: "var(--text-color)",
                opacity: "0.5",
                fontSize: "14px",
              }}
            >
              Service Fee
            </Typography>
            <Typography
              component="div"
              sx={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <span style={{ fontSize: "14px", color: "var(--text-color)" }}>
                {systemSetting?.mintPiqsolFee} PQL
              </span>
              <InfoOutlinedIcon
                style={{ fontSize: "18px", color: "var(--text-color)" }}
              />
            </Typography>
          </Typography>

          <Divider sx={{ marginTop: "20px", marginBottom: "10px" }} />
        </Typography>
      </Box>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAndCondition}
              onChange={(e) => setTermsAndCondition(e.target.checked)}
              icon={<CustomUnMarkIcon />}
              checkedIcon={<CustomMarkIcon />}
            />
          }
          label={
            <Typography className={Classes.checkboxLabel}>
              I agree to all terms and conditions of the PIQSOL web platform and
              duly accept the entire copyright transfer agreement included in
              the terms and conditions section of the platform.
            </Typography>
          }
        />
      </FormGroup>
    </Box>
  );
};

export default SellMethodTabsContent;
