import * as React from "react";
import {
  Typography,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Checkbox,
} from "@mui/material";
import Classes from "../../style/Common/FiltersSidebar.module.scss";
import CustomSelectStyles from "../../style/Common/CustomSelect.module.scss";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import { styled } from "@mui/material/styles";
import Radio, { RadioProps } from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputUnstyled from "@mui/base/InputUnstyled";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import logo from "assets/images/card-badge.png";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ReactComponent as FilterIcon } from "../../assets/icons/SVG/Filter.svg";
import { makeStyles } from "@mui/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  setExpanded,
  setSelectedAttributes,
} from "store/reducers/filterReducer";
import {
  addExpandedValues,
  CHAIN_LOGOS,
  CHAIN_TITLE,
  checkForExpendedOrNot,
  getFilterQueryForBackend,
  removeAlreadyExpanded,
} from "./helpers/helpers";

const useStyles = makeStyles({
  root: {
    "& .css-o4b71y-MuiAccordionSummary-content.Mui-expanded": {
      margin: "0",
    },
    "& .css-sh22l5-MuiButtonBase-root-MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "40px",
      paddingLeft: 0,
    },
    "& .MuiAccordionDetails-root": {
      paddingLeft: 0,
    },
    "& .css-1rrht2n": {
      backgroundImage: "none",
      border: "1px solid var(--border-color)",
    },
    "& .MuiAccordionSummary-gutters": {
      paddingLeft: "0",
    },
  },
});

const FiltersSidebar = ({
  onFilterChange,
  filter,
  onRangeChange,
  showStatus,
  showMinted,
  showAttributes,
  showVerification,
  showCategories,
  showRange,
  showCollections,
  callingFrom,
  passAttribute,
  attributes,
  showSaleSold,
  blockchainType,
}: {
  onFilterChange: Function;
  filter: any;
  onRangeChange: Function;
  showStatus?: boolean;
  showRange?: boolean;
  showMinted?: boolean;
  showAttributes?: boolean;
  showVerification?: boolean;
  showCategories?: boolean;
  showCollections?: boolean;
  callingFrom?: string;
  passAttribute?: any;
  attributes?: any;
  showSaleSold?: boolean;
  blockchainType?: string;
}) => {
  console.log(
    "🚀 ~ file: FiltersSidebar.tsx ~ line 97 ~ blockchainType",
    blockchainType
  );
  const expanded = useSelector((state: any) => state?.filterReducer?.expanded);
  const selectedAttributes = useSelector(
    (state: any) => state?.filterReducer?.selectedAttributes
  );
  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );

  const dispatch = useDispatch();
  const CircleIconPlus = () => {
    return (
      <Typography component="span" className={Classes.collapseIconWrapper}>
        <AddOutlinedIcon className={Classes.collapseIcon} />
      </Typography>
    );
  };
  const CircleIconMinus = () => {
    return (
      <Typography component="span" className={Classes.collapseIconWrapper}>
        <RemoveOutlinedIcon className={Classes.collapseIcon} />
      </Typography>
    );
  };

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      dispatch(
        setExpanded(
          newExpanded
            ? addExpandedValues(expanded, panel)
            : removeAlreadyExpanded(expanded, panel)
        )
      );
    };

  const BpIcon = styled("span")(({ theme }) => ({
    borderRadius: "50%",
    width: 16,
    height: 16,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 0 0 1px rgb(16 22 26 / 40%)"
        : "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
    backgroundImage:
      theme.palette.mode === "dark"
        ? "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))"
        : "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
    ".Mui-focusVisible &": {
      outline: "2px auto rgba(19,124,189,.6)",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: theme.palette.mode === "dark" ? "#30404d" : "#ebf1f5",
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background:
        theme.palette.mode === "dark"
          ? "rgba(57,75,89,.5)"
          : "rgba(206,217,224,.5)",
    },
  }));

  const BpCheckedIcon = styled(BpIcon)({
    backgroundColor: "#43F195",
    boxShadow: "None",
    backgroundImage:
      "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
    "&:before": {
      display: "block",
      width: 16,
      height: 16,
      backgroundImage: "radial-gradient(#fff,#fff 28%,transparent 32%)",
      content: '""',
    },
    "input:hover ~ &": {
      backgroundColor: "#43F195",
    },
  });

  function BpRadio(props: RadioProps) {
    return (
      <Radio
        sx={{
          "&:hover": {
            bgcolor: "transparent",
          },
        }}
        disableRipple
        color="default"
        checkedIcon={<BpCheckedIcon />}
        icon={<BpIcon />}
        {...props}
      />
    );
  }

  const [currency, setCurrency] = React.useState("solana");
  const [filters, setFilters] = React.useState({
    status: "",
    range: { min: "", max: "", value: "" },
  });

  function onChange(event: any, panel) {
    let latestFilterValues = {
      ...filters,
      status: getFilterQueryForBackend(
        expanded.find((expandedPanel) => expandedPanel === panel),
        event.target.value,
        callingFrom || "",
        passAttribute || ""
      ),
      value: event.target.value,
    };
    setFilters(latestFilterValues);
    onFilterChange(latestFilterValues);
  }
  function checkStatusOfAttribute(value, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].value.includes(value)) {
        return true;
      }
    }
  }
  // Add & Remove checked item from list
  const handleCheck = (event, value, key) => {
    var selectedFilter = {};
    selectedFilter["trait_type"] = key;
    selectedFilter["value"] = value;
    let latestFilterValues = { ...filters, status: "", value: "" };
    if (event.target.checked) {
      dispatch(setSelectedAttributes([...selectedAttributes, selectedFilter]));
      latestFilterValues = {
        ...filters,
        status: getFilterQueryForBackend(
          "attribute",
          event.target.value,
          callingFrom || "",
          [...selectedAttributes, selectedFilter] || ""
        ),
        value: event.target.value,
      };
    } else {
      const removeAttribute = selectedAttributes.filter(
        (item) => item?.value !== value
      );
      dispatch(setSelectedAttributes(removeAttribute));
      latestFilterValues = {
        ...filters,
        status: getFilterQueryForBackend(
          "attribute",
          event.target.value,
          callingFrom || "",
          removeAttribute || ""
        ),
        value: event.target.value,
      };
    }

    setFilters(latestFilterValues);
    onFilterChange(latestFilterValues);
  };

  async function applyRangeFilter() {
    setTimeout(() => {
      filters.status = filter.status;
      if (
        parseFloat(filters.range.min) >= 0 &&
        parseFloat(filters.range.max) >= 0 &&
        parseFloat(filters.range.max) >= parseFloat(filters.range.min)
      ) {
        onRangeChange(filters);
      }
    }, 4000);
  }

  const Styles = useStyles();

  return (
    <aside className={Classes.pagesSidebar}>
      <Box className={`${Styles.root}`}>
        <Typography component="div" className={Classes.titleWrapper}>
          <FilterIcon />
          <Typography
            component="span"
            className={Classes.title}
            sx={{ position: "relative", top: "4px" }}
          >
            FILTERS
          </Typography>
        </Typography>

        {showStatus && (
          <Accordion
            expanded={checkForExpendedOrNot(expanded, "panel1")}
            onChange={handleChange("panel1")}
            className={Classes.accordionWrapper}
          >
            <AccordionSummary
              expandIcon={
                checkForExpendedOrNot(expanded, "panel1") ? (
                  <CircleIconMinus />
                ) : (
                  <CircleIconPlus />
                )
              }
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={Classes.accordianTitle}>Type</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                value={filter.value}
                aria-labelledby="demo-customized-radios"
                name="customized-radios"
                onChange={(event) => onChange(event, "panel1")}
              >
                <Typography component="div" className={Classes.filterContainer}>
                  <FormControlLabel
                    value="All"
                    control={<BpRadio />}
                    label={
                      <Typography
                        component="span"
                        className={Classes.labelText}
                      >
                        All
                      </Typography>
                    }
                  />
                </Typography>

                <Typography component="div" className={Classes.filterContainer}>
                  <FormControlLabel
                    value="fixedPrice"
                    control={<BpRadio />}
                    label={
                      <Typography
                        component="span"
                        className={Classes.labelText}
                      >
                        Buy Now
                      </Typography>
                    }
                  />
                </Typography>

                <Typography component="div" className={Classes.filterContainer}>
                  <FormControlLabel
                    value="highestBid"
                    control={<BpRadio />}
                    label={
                      <Typography
                        component="span"
                        className={Classes.labelText}
                      >
                        On Auction
                      </Typography>
                    }
                  />
                </Typography>
                <Typography component="div" className={Classes.filterContainer}>
                  <FormControlLabel
                    value="fractional"
                    control={<BpRadio />}
                    label={
                      <Typography
                        component="span"
                        className={Classes.labelText}
                      >
                        Fractional
                      </Typography>
                    }
                  />
                </Typography>
              </RadioGroup>
            </AccordionDetails>
          </Accordion>
        )}
        <Divider />

        {showMinted && (
          <>
            <Accordion
              expanded={checkForExpendedOrNot(expanded, "panel2")}
              onChange={handleChange("panel2")}
              className={Classes.accordionWrapper}
            >
              <AccordionSummary
                expandIcon={
                  checkForExpendedOrNot(expanded, "panel2") ? (
                    <CircleIconMinus />
                  ) : (
                    <CircleIconPlus />
                  )
                }
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography className={Classes.accordianTitle}>
                  Minted
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <RadioGroup
                  value={filter.value}
                  aria-labelledby="demo-customized-radios"
                  name="customized-radios"
                  onChange={(event) => onChange(event, "panel2")}
                >
                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="All-Minted"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          All
                        </Typography>
                      }
                    />
                  </Typography>

                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="solana"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          Solana
                        </Typography>
                      }
                    />
                  </Typography>

                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="polygon"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={`${Classes.labelText}`}
                        >
                          Polygon Matic
                        </Typography>
                      }
                    />
                  </Typography>
                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="binance"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={`${Classes.labelText}`}
                        >
                          Binance Smart Chain
                        </Typography>
                      }
                    />
                  </Typography>
                </RadioGroup>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </>
        )}

        {showAttributes && attributes?.length > 0 && (
          <>
            <Accordion
              expanded={checkForExpendedOrNot(expanded, "attributeFilter")}
              onChange={handleChange("attributeFilter")}
              className={Classes.accordionWrapper}
            >
              <AccordionSummary
                expandIcon={
                  checkForExpendedOrNot(expanded, "attributeFilter") ? (
                    <CircleIconMinus />
                  ) : (
                    <CircleIconPlus />
                  )
                }
                aria-controls="attributeFiltera-content"
                id="attributeFiltera-header"
              >
                <Typography className={Classes.accordianTitle}>
                  Attribute Filter
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {attributes
                  ?.sort((pre, next) => (pre?.type < next?.type ? -1 : 1))
                  ?.map((attribute) => (
                    <>
                      <Accordion
                        expanded={checkForExpendedOrNot(
                          expanded,
                          attribute?.type
                        )}
                        onChange={handleChange(attribute?.type)}
                        className={Classes.accordionWrapper}
                      >
                        <AccordionSummary
                          expandIcon={
                            checkForExpendedOrNot(expanded, attribute?.type) ? (
                              <CircleIconMinus />
                            ) : (
                              <CircleIconPlus />
                            )
                          }
                          aria-controls="backgrounda-content"
                          id="background-header"
                        >
                          <Typography
                            className={`${Classes.accordianTitle} ${Classes.capitalizeMe}`}
                          >
                            {attribute?.type?.toUpperCase()}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {attribute?.values
                            ?.sort((pre, next) => (pre < next ? -1 : 1))
                            ?.map((value) => (
                              <Typography
                                component="div"
                                className={Classes.filterContainer}
                              >
                                <FormControlLabel
                                  sx={{
                                    "& .Mui-checked svg": {
                                      fill: "#43F195 !important",
                                    },
                                  }}
                                  className={Classes.labelText}
                                  control={
                                    <Checkbox
                                      defaultChecked={checkStatusOfAttribute(
                                        value,
                                        selectedAttributes
                                      )}
                                    />
                                  }
                                  label={value}
                                  onChange={(event) =>
                                    handleCheck(event, value, attribute?.type)
                                  }
                                />
                              </Typography>
                            ))}
                        </AccordionDetails>
                      </Accordion>
                      <Divider />
                    </>
                  ))}
              </AccordionDetails>
            </Accordion>
            {!checkForExpendedOrNot(expanded, "attributeFilter") && <Divider />}
          </>
        )}

        {showVerification && (
          <>
            <Accordion
              expanded={checkForExpendedOrNot(expanded, "panel3")}
              onChange={handleChange("panel3")}
              className={Classes.accordionWrapper}
            >
              <AccordionSummary
                expandIcon={
                  checkForExpendedOrNot(expanded, "panel3") ? (
                    <CircleIconMinus />
                  ) : (
                    <CircleIconPlus />
                  )
                }
                aria-controls="panel3a-content"
                id="panel3a-header"
              >
                <Typography className={Classes.accordianTitle}>
                  Verification
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <RadioGroup
                  value={filter.value}
                  aria-labelledby="demo-customized-radios"
                  name="customized-radios"
                  onChange={(event) => onChange(event, "panel3")}
                >
                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="All-Verification"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          All
                        </Typography>
                      }
                    />
                  </Typography>

                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="true"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          Verified
                        </Typography>
                      }
                    />
                  </Typography>
                </RadioGroup>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </>
        )}

        {showCategories && (
          <>
            <Accordion
              expanded={checkForExpendedOrNot(expanded, "categories")}
              onChange={handleChange("categories")}
              className={Classes.accordionWrapper}
            >
              <AccordionSummary
                expandIcon={
                  checkForExpendedOrNot(expanded, "categories") ? (
                    <CircleIconMinus />
                  ) : (
                    <CircleIconPlus />
                  )
                }
                aria-controls="categoriesa-content"
                id="categoriesa-header"
              >
                <Typography className={Classes.accordianTitle}>
                  Categories
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <RadioGroup
                  value={filter.value}
                  aria-labelledby="demo-customized-radios"
                  name="customized-radios"
                  onChange={(event) => onChange(event, "categories")}
                >
                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="All-Categories"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          All
                        </Typography>
                      }
                    />
                  </Typography>

                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="image"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          Image
                        </Typography>
                      }
                    />
                  </Typography>
                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="video"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          Video
                        </Typography>
                      }
                    />
                  </Typography>
                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="audio"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          Audio
                        </Typography>
                      }
                    />
                  </Typography>
                  <Typography
                    component="div"
                    className={Classes.filterContainer}
                  >
                    <FormControlLabel
                      value="vr"
                      control={<BpRadio />}
                      label={
                        <Typography
                          component="span"
                          className={Classes.labelText}
                        >
                          3D Model
                        </Typography>
                      }
                    />
                  </Typography>
                </RadioGroup>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </>
        )}

        {showRange && (
          <>
            <Accordion
              expanded={checkForExpendedOrNot(expanded, "priceRange")}
              onChange={handleChange("priceRange")}
              className={Classes.accordionWrapper}
            >
              <AccordionSummary
                expandIcon={
                  checkForExpendedOrNot(expanded, "priceRange") ? (
                    <CircleIconMinus />
                  ) : (
                    <CircleIconPlus />
                  )
                }
                aria-controls="priceRangea-content"
                id="priceRangea-header"
              >
                <Typography className={Classes.accordianTitle}>
                  Price Range
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {blockchainType ? (
                  <Typography className={CustomSelectStyles.menuItemText}>
                    <Typography
                      component="div"
                      className={Classes.selectTitleWrapper}
                    >
                      <span className={Classes.dollorIcon}>
                        <img
                          src={CHAIN_LOGOS[blockchainType]}
                          alt="logo"
                          className={Classes.logo}
                        />
                      </span>
                      <Typography
                        component="span"
                        sx={{ color: "var(--text-color)" }}
                        className={`VisbyMedium ${Classes.countryName}`}
                      >
                        {CHAIN_TITLE[blockchainType]}
                      </Typography>
                    </Typography>
                  </Typography>
                ) : (
                  <FormControl sx={{ maxWidth: "100%", width: "100%" }}>
                    <Select
                      value={currency}
                      onChange={(event) =>
                        setCurrency(event.target.value as string)
                      }
                      displayEmpty
                      IconComponent={() => (
                        <KeyboardArrowDownIcon
                          className={CustomSelectStyles.iconDown}
                          style={{ top: "8px !important" }}
                        />
                      )}
                      inputProps={{ "aria-label": "Without label" }}
                      className={CustomSelectStyles.customSelect}
                      sx={{
                        borderRadius: "26px !important",
                        minWidth: "185px",
                        width: "100% !important",
                        height: "45px",
                      }}
                    >
                      <MenuItem
                        className={CustomSelectStyles.menuItemText}
                        value="solana"
                      >
                        <Typography
                          component="div"
                          className={Classes.selectTitleWrapper}
                        >
                          <span className={Classes.dollorIcon}>
                            <img
                              src={CHAIN_LOGOS.solana}
                              alt="logo"
                              className={Classes.logo}
                            />
                          </span>
                          <Typography
                            component="span"
                            sx={{ color: "var(--text-color)" }}
                            className={`VisbyMedium ${Classes.countryName}`}
                          >
                            {CHAIN_TITLE.solana}
                          </Typography>
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        className={CustomSelectStyles.menuItemText}
                        value="polygon"
                      >
                        <Typography
                          component="div"
                          className={Classes.selectTitleWrapper}
                        >
                          <span className={Classes.dollorIcon}>
                            <img
                              src={CHAIN_LOGOS.polygon}
                              alt="logo"
                              className={Classes.logo}
                            />
                          </span>
                          <Typography
                            component="span"
                            sx={{ color: "var(--text-color)" }}
                            className={`VisbyMedium ${Classes.countryName}`}
                          >
                            {CHAIN_TITLE.polygon}
                          </Typography>
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        className={CustomSelectStyles.menuItemText}
                        value="binance"
                      >
                        <Typography
                          component="div"
                          className={Classes.selectTitleWrapper}
                        >
                          <span className={Classes.dollorIcon}>
                            <img
                              src={CHAIN_LOGOS.binance}
                              alt="logo"
                              className={Classes.logo}
                            />
                          </span>
                          <Typography
                            component="span"
                            sx={{ color: "var(--text-color)" }}
                            className={`VisbyMedium ${Classes.countryName}`}
                          >
                            {CHAIN_TITLE.binance}
                          </Typography>
                        </Typography>
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
                <Typography component="div" className={Classes.minMaxWrapper}>
                  <Typography component="div" sx={{ maxWidth: "100%" }}>
                    <InputUnstyled
                      onChange={(e: any) => {
                        let tempFilters = { ...filters };
                        tempFilters.range.min = e.target.value;
                        let val = e.target.value;
                        e.target.value = String(e.target.value).replace(
                          /[^\d\.]+/g,
                          ""
                        );
                      }}
                      name="min"
                      placeholder="Min"
                      className={Classes.rangeInput}
                      required={true}
                      type={"number"}
                    />
                  </Typography>
                  <Typography
                    sx={{ fontSize: "14px;", color: "var(--text-color)" }}
                  >
                    to
                  </Typography>
                  <Typography component="div">
                    <InputUnstyled
                      onChange={(e: any) => {
                        let tempFilters = { ...filters };
                        tempFilters.range.max = e.target.value;
                        e.target.value = String(e.target.value).replace(
                          /[^\d\.]+/g,
                          ""
                        );
                        tempFilters.range.value = currency;
                        setFilters(tempFilters);
                        applyRangeFilter();
                      }}
                      name="max"
                      placeholder="Max"
                      className={Classes.rangeInput}
                      required={true}
                      type={"number"}
                    />
                  </Typography>
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </>
        )}

        {showCollections && (
          <>
            <Accordion
              expanded={checkForExpendedOrNot(expanded, "collections")}
              onChange={handleChange("collections")}
              className={Classes.accordionWrapper}
            >
              <AccordionSummary
                expandIcon={
                  checkForExpendedOrNot(expanded, "collections") ? (
                    <CircleIconMinus />
                  ) : (
                    <CircleIconPlus />
                  )
                }
                aria-controls="collectionsa-content"
                id="collectionsa-header"
              >
                <Typography className={Classes.accordianTitle}>
                  Collections
                </Typography>
              </AccordionSummary>
              <AccordionDetails>collections</AccordionDetails>
            </Accordion>
            <Divider />
          </>
        )}

        {showSaleSold && (
          <>
            <Accordion
              expanded={checkForExpendedOrNot(expanded, "saleSold")}
              onChange={handleChange("saleSold")}
              className={Classes.accordionWrapper}
            >
              <AccordionSummary
                expandIcon={
                  checkForExpendedOrNot(expanded, "saleSold") ? (
                    <CircleIconMinus />
                  ) : (
                    <CircleIconPlus />
                  )
                }
                aria-controls="collectionsa-content"
                id="collectionsa-header"
              >
                <Typography className={Classes.accordianTitle}>
                  Listings
                </Typography>
              </AccordionSummary>
              <RadioGroup
                value={filter.value}
                aria-labelledby="demo-customized-radios"
                name="customized-radios"
                onChange={(event) => onChange(event, "saleSold")}
              >
                <Typography component="div" className={Classes.filterContainer}>
                  <FormControlLabel
                    value="All"
                    control={<BpRadio />}
                    label={
                      <Typography
                        component="span"
                        className={Classes.labelText}
                      >
                        All
                      </Typography>
                    }
                  />
                </Typography>
                <Typography component="div" className={Classes.filterContainer}>
                  <FormControlLabel
                    value="sale"
                    control={<BpRadio />}
                    label={
                      <Typography
                        component="span"
                        className={Classes.labelText}
                      >
                        On Sale
                      </Typography>
                    }
                  />
                </Typography>
                <Typography component="div" className={Classes.filterContainer}>
                  <FormControlLabel
                    value="sold"
                    control={<BpRadio />}
                    label={
                      <Typography
                        component="span"
                        className={Classes.labelText}
                      >
                        Sold Or Not Listed
                      </Typography>
                    }
                  />
                </Typography>
              </RadioGroup>
            </Accordion>
          </>
        )}
      </Box>
    </aside>
  );
};

export default FiltersSidebar;
