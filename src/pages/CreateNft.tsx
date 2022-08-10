import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  InputLabel,
  Select,
  Container,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Classes from "../style/createNft.module.scss";
import { useWallet } from "@solana/wallet-adapter-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faPlus,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

import validationSchema, {
  IMAGE_FILE_SIZE,
} from "../utils/formsValidations/createNftValidation";
import { Creator } from "../utils/helpers/createNft";
import { endpoint } from "../utils/helpers/getChainNetwork";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { getCollectionDetail } from "../store/reducers/collectionReducer";
import { useNavigate, useParams } from "react-router-dom";
import {
  uploadFileToIpfs,
  uploadJSONToIpfs,
} from "../utils/helpers/uploadFileToIpfs";
// import { AnySchema } from "yup";
import DragDropFileUpload from "../components/common/DragDropFileUpload";
import { addNft } from "store/reducers/nftReducer";
import { mintNFT } from "../utils/helpers/mintnftcandy";
import CustomSelectClasses from "../style/Common/CustomSelect.module.scss";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ScrollToTop from "./ScrollToTop";
import { getUserBalance } from "utils/helpers/getUserBalance";
import { authSelector } from "store/reducers/authReducer";
import { getWeb3 } from "../web3/web3";
import { mintNewNFT } from "../web3/contractHelpers";
import {
  CHAIN_LOGOS,
  CHAIN_TITLE,
  extractErrorMessage,
} from "components/common/helpers/helpers";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { Connection } from "@metaplex/js";

const MAX_RETRIES = 24;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function metaplexConfirm(tx: any) {
  let confirmedTx = null;
  for (let tries = 0; tries < MAX_RETRIES; tries++) {
    confirmedTx = await new Connection(
      endpoint.url,
      "finalized"
    ).getTransaction(tx);
    if (confirmedTx) break;
    await sleep(3000);
  }
  if (!confirmedTx) throw new Error("Could not find requested transaction");
}

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

const CreateNft = () => {
  const wallet: any = useWallet();
  const dispatch = useDispatch();
  const params: any = useParams();
  const navigate = useNavigate();

  const { isAuth } = useSelector(authSelector).authReducer;

  const currentUser = useSelector(
    (state: any) => state?.authReducer?.currentUser
  );
  const [creators, setCreators] = useState([
    new Creator({
      address: wallet.publicKey?.toBase58(),
      verified: true,
      share: 100,
    }),
  ]);
  const [termsAndCondition, setTermsAndContition] =
    React.useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<any>();
  const [collection, setCollection] = useState<any>();
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<any>();
  const [fileTypes, setFileTypes] = useState<any>([
    "image/jpg",
    "image/png",
    "image/svg+xml",
    "image/gif, image/jpeg",
  ]);

  const [nftProperties, setNftProperties] = useState<Array<any>>([
    { trait_type: "", value: "" },
  ]);
  const [attributeMessage, setAttributeMessage] = useState<boolean>(false);

  const [attributes, setAttributes] = useState<any>({
    name: "",
    description: "",
    symbol: "",
    external_url: "",
    image: "",
    animation_url: undefined,
    attributes: undefined,
    sellerFeeBasisPoints: 1000,
    creators: creators,
    properties: {
      files: [],
      category: "image",
    },
  });
  const systemSetting = useSelector(
    (state: any) => state?.systemSettingReducer?.systemSettings
  );
  const getCollectionData = async () => {
    const collection = await dispatch(getCollectionDetail(params.id));
    setCollection(collection);
  };

  const multiChainDetails = async (selectedChain: string) => {
    if (selectedChain.toLocaleLowerCase() !== "solana") {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      setCreators([
        new Creator({
          address: accounts[0],
          verified: true,
          share: 100,
        }),
      ]);
      await getCollectionData();
      return;
    }
    if (wallet.connected) {
      setCreators([
        new Creator({
          address: wallet.publicKey?.toBase58(),
          verified: true,
          share: 100,
        }),
      ]);
      await getCollectionData();
      return;
    }
  };

  useEffect(() => {
    multiChainDetails(currentUser?.chainType || "solana");
  }, [wallet, isAuth]);

  const pinFileToIPFS = async (file: any): Promise<string> => {
    const fileData: any = await uploadFileToIpfs(file);
    if (fileData?.data?.IpfsHash) {
      const fileUrl: string = `https://piqsol.mypinata.cloud/ipfs/${fileData.data.IpfsHash}`;
      return fileUrl;
    }
  };

  const checkUserBalance = async () => {
    const userBalance = await getUserBalance(currentUser?.chainType, wallet);
    if (systemSetting?.mintPiqsolFee > userBalance.userPiqsolBalance) {
      setCreateLoading(false);

      dispatch(
        setMessage(
          "You don't have enough PiqSol Tokens or SOL, please recharge"
        )
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));

      return false;
    }
    if (userBalance?.userNativeBalance > 0) {
      return true;
    }
    return false;
  };

  const mintNft = async () => {
    try {
      setCreateLoading(true);

      if (currentUser?.chainType?.toLowerCase() === "solana") {
        const userHaveBalance = await checkUserBalance();
        if (!userHaveBalance) {
          setCreateLoading(false);
          dispatch(
            setMessage(
              "You don't have enough PiqSol Tokens or SOL, please recharge"
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          return;
        }
      }

      const uploadedNftFile = await pinFileToIPFS(formik?.values?.nftFile);
      let uploadedThumbnailFile = "";
      if (formik.values.fileType !== "image") {
        uploadedThumbnailFile = await pinFileToIPFS(
          formik?.values?.nftThumbnailFile
        );
      }
      let attributesFiles = [
        {
          type:
            formik?.values?.nftFile && formik?.values?.nftFile["type"]
              ? formik?.values?.nftFile["type"]
              : formik?.values?.nftFile["name"].split(".").pop(),
          uri: uploadedNftFile || "",
        },
      ];
      if (formik.values.fileType !== "image") {
        attributesFiles.push({
          type: formik?.values?.nftThumbnailFile
            ? formik?.values?.nftThumbnailFile["type"]
            : "",
          uri: uploadedThumbnailFile || "",
        });
      }
      const nftFilteredAttributes = [];
      nftProperties.forEach((pro) => {
        if (pro.trait_type !== "" && pro.value !== "") {
          const alreadyExists = nftFilteredAttributes?.findIndex(
            (property) =>
              property.trait_type?.replace(" ", "")?.toLowerCase() ===
                pro.trait_type?.replace(" ", "")?.toLowerCase() &&
              property.value?.replace(" ", "")?.toLowerCase() ===
                pro.value?.replace(" ", "")?.toLowerCase()
          );

          if (alreadyExists < 0) {
            nftFilteredAttributes.push(pro);
          }
        }
      });

      await setAttributes({
        ...attributes,
        creators,
        collection: {
          name: collection?.fullName,
          description: collection?.description,
          id: collection._id,
        },
        name: formik?.values?.name,
        description: formik?.values?.description,
        attributes: nftFilteredAttributes,
        symbol: "",
        image: formik?.values?.nftFile ? formik?.values?.nftFile["name"] : "",
        properties: {
          ...attributes.properties,
          category: formik?.values?.fileType,
          files: attributesFiles,
        },
      });
      let metaDataImage = null;
      if (formik.values.fileType !== "image") {
        metaDataImage = uploadedThumbnailFile;
      } else {
        metaDataImage = uploadedNftFile || "";
      }
      const metadataContent = {
        collection: {
          name: collection.fullName,
          description: collection?.description,
          id: collection._id,
        },
        name: formik?.values?.name,
        symbol: "",
        description: formik?.values?.description,
        seller_fee_basis_points: systemSetting?.royalityFeePercentage * 100,
        image: metaDataImage,
        animation_url:
          currentUser?.chainType?.toLowerCase() !== "solana" ||
          formik.values.fileType === "vr"
            ? uploadedNftFile
            : undefined,
        attributes: nftFilteredAttributes,
        artistName: formik.values.artistName,
        external_url: formik.values.externalUrl,
        properties: {
          ...attributes.properties,
          files: attributesFiles,
          category: formik?.values?.fileType,
          creators: creators?.map((creator: any) => {
            return {
              address: creator?.address,
              share: creator?.share,
            };
          }),
        },
      };

      const ipfsJsonData = await uploadJSONToIpfs(metadataContent);

      if (currentUser?.chainType.toLowerCase() !== "solana") {
        try {
          const newlyMintNftResponse: any = await mintNewNFT(
            currentUser,
            `https://piqsol.mypinata.cloud/ipfs/${ipfsJsonData.data.IpfsHash}`,
            systemSetting?.mintPiqsolFee || 0
          );

          if (newlyMintNftResponse === -2) {
            setCreateLoading(false);
            dispatch(
              setMessage(
                "You don't have PQL tokens or there is something went wrong while fetching your balance"
              )
            );
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));
            return;
          }

          if (newlyMintNftResponse === false) {
            setCreateLoading(false);

            dispatch(setMessage("Approval for tax paying is required"));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(false));
            return;
          }

          if (newlyMintNftResponse?.mintNftResults?.status) {
            const nftData: any = await dispatch(
              addNft({
                metadataContent,
                txnHash: newlyMintNftResponse?.mintNftResults?.transactionHash,
                contractAddress: newlyMintNftResponse?.contractAddress,
                tokenId:
                  newlyMintNftResponse?.mintNftResults?.events?.Transfer
                    ?.returnValues?.tokenId,
                blockchainType: currentUser?.chainType?.toLowerCase(),
              })
            );

            dispatch(setMessage("NFT Created Successfully"));
            dispatch(setIsOpen(true));
            dispatch(setIsSuccess(true));

            navigate(`/explore/explore-details/${nftData?.data?._id}`);
            setCreateLoading(false);
            return;
          }

          dispatch(setMessage("Something went wrong while Minting NFT"));
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));

          setCreateLoading(false);
          return;
        } catch (err) {
          setCreateLoading(false);
          dispatch(
            setMessage(
              "Something went wrong while Minting NFT" +
                extractErrorMessage(err)
            )
          );
          dispatch(setIsOpen(true));
          dispatch(setIsSuccess(false));
          console.log(
            "🚀 ~ file: CreateNft.tsx ~ line 348 ~ mintNft ~ err",
            err
          );
          return;
        }
      }

      const connection = new Connection(endpoint.url, "confirmed");

      const mintNFTResponse = await mintNFT({
        connection,
        wallet,
        uri: `https://piqsol.mypinata.cloud/ipfs/${ipfsJsonData.data.IpfsHash}`,
        metadataContent,
        payTax: false,
        taxPayValue: systemSetting?.mintPiqsolFee,
      });

      if (mintNFTResponse === -1) {
        setCreateLoading(false);
        dispatch(
          setMessage(
            "You must have sol and piqsol token in your wallet for this action"
          )
        );
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }

      await metaplexConfirm(
        mintNFTResponse.res.txList[mintNFTResponse.res.txList.length - 1]
      );
      const nftData: any = await dispatch(
        addNft({
          mint: mintNFTResponse?.mint?.toBase58(),
          metadata: mintNFTResponse?.metadata?.toBase58(),
          edition: mintNFTResponse?.edition?.toBase58(),
          blockchainType: "solana",
        })
      );
      dispatch(setMessage("NFT Created Successfully"));
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(true));

      navigate(`/explore/explore-details/${nftData?.data?._id}`);
      setCreateLoading(false);
      return;
    } catch (error: any) {
      console.log("create nft errror", error);
      setCreateLoading(false);
      dispatch(
        setMessage(`Error In Minting NFT: ${extractErrorMessage(error)}`)
      );
      dispatch(setIsOpen(true));
      dispatch(setIsSuccess(false));
    }
  };

  const formik: any = useFormik({
    initialValues: {
      fileType: "image",
      nftFile: null,
      name: "",
      artistName: "",
      nftThumbnailFile: null,
      description: "",
      externalUrl: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (!termsAndCondition) {
        dispatch(setMessage("Please accept terms and conditions"));
        dispatch(setIsOpen(true));
        dispatch(setIsSuccess(false));
        return;
      }
      if (formik.values.name.trim() === "") {
        return formik.setFieldError("name", "Name is required");
      }
      if (formik.values.name.trim().length < 4) {
        return formik.setFieldError(
          "name",
          "Name should be of minimum 4 characters length"
        );
      }

      formik.setFieldError("nftThumbnailFile", "");
      formik.setFieldError("artistName", "");

      if (
        formik.values.fileType !== "image" &&
        !formik.values.nftThumbnailFile
      ) {
        return formik.setFieldError(
          "nftThumbnailFile",
          "Thumbnail image is required"
        );
      }
      if (
        formik.values.fileType !== "image" &&
        formik.values.nftThumbnailFile &&
        formik.values.nftThumbnailFile.size > IMAGE_FILE_SIZE
      ) {
        return formik.setFieldError(
          "nftThumbnailFile",
          "Thumbnail image too large, max size should be 10mb"
        );
      }
      if (
        formik.values.fileType === "audio" &&
        (!formik.values.artistName || formik.values.artistName.trim() === "")
      ) {
        return formik.setFieldError("artistName", "Artist name is required");
      }
      if (
        formik.values.fileType === "audio" &&
        formik.values.artistName.trim().length < 4
      ) {
        return formik.setFieldError(
          "artistName",
          "Artist name should be of minimum 4 characters length"
        );
      }
      setAttributes({
        ...attributes,
        name: values.name,
        description: values.description,
        symbol: values.name,
      });
      mintNft();
    },
  });

  const handleFileChangeUpload = (files: any) => {
    let reader = new FileReader();
    let file = files[files.length - 1];
    if (file) {
      reader.onloadend = () => {
        setSelectedFile(reader?.result);
      };
      reader.readAsDataURL(file);
      formik.setFieldValue("nftFile", file);
    }
  };
  const handleImageDrop = (files: any) => {
    formik.setFieldValue("nftFile", "");
  };
  const handleImageDropForThumbnail = (files: any) => {
    formik.setFieldValue("nftThumbnailFile", "");
  };

  const handleThumbnailChangeUpload = (files: any) => {
    let reader = new FileReader();
    let file = files[files.length - 1];
    if (file) {
      reader.onloadend = () => {
        setSelectedImage(reader?.result);
      };
      reader.readAsDataURL(file);
      formik.setFieldValue("nftThumbnailFile", file);
    }
  };

  const handleBackClick = (event) => {
    navigate(
      `/${collection?.userId?._id}/myCreated/detail/${collection?._id}/items`
    );
  };

  const addMoreProperties = (event) => {
    setAttributeMessage(false);
    event.preventDefault();
    const latestProperty = nftProperties[nftProperties.length - 1];
    if (latestProperty.trait_type === "" || latestProperty.value === "") {
      setAttributeMessage(true);
      return;
    }
    const nftAttributes: Array<any> = nftProperties;
    nftAttributes.push({ trait_type: "", value: "" });
    setNftProperties([...nftAttributes]);
  };

  const removeNftProperties = (index) => {
    const nftAttributes: Array<any> = nftProperties;
    nftAttributes.splice(index, 1);
    setNftProperties([...nftAttributes]);
  };

  const updateNftPropertiesTitle = (title, index) => {
    const nftAttributes: Array<any> = nftProperties;
    nftAttributes[index].trait_type = title;
    setNftProperties([...nftAttributes]);
  };

  const updateNftPropertiesValue = (value, index) => {
    const nftAttributes: Array<any> = nftProperties;
    nftAttributes[index].value = value;
    setNftProperties([...nftAttributes]);
  };

  return (
    <Container>
      <ScrollToTop />
      <Box className={Classes.wrapper}>
        <form onSubmit={formik.handleSubmit}>
          <Box onClick={handleBackClick} className={Classes.back}>
            <FontAwesomeIcon icon={faChevronLeft} />

            <Typography className="VisbyBold">Back</Typography>
          </Box>

          <Typography
            variant="h3"
            className="VisbyExtrabold"
            sx={{ color: "var(--text-color)" }}
          >
            Create a New NFT
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box className={Classes.block}>
                <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                  Select type of NFT that you like to create
                </InputLabel>
                <Select
                  fullWidth
                  id="fileType"
                  name="fileType"
                  value={formik.values.fileType}
                  className={`${Classes.imageSelect} ${CustomSelectClasses.customSelect}`}
                  sx={{ height: "45px" }}
                  IconComponent={() => (
                    <KeyboardArrowDownIcon
                      className={CustomSelectClasses.iconDown}
                    />
                  )}
                  onChange={async (e) => {
                    formik.setFieldValue("fileType", e.target.value);
                    formik.setFieldValue("nftFile", null);
                    setSelectedFile(null);

                    if (e.target.value === "vr") {
                      setFileTypes(".glb");
                    } else if (e.target.value === "audio") {
                      setFileTypes([".mp3", ".ogg", ".wav"]);
                    } else if (e.target.value === "video") {
                      setFileTypes([".mp4", ".webm"]);
                    } else {
                      setFileTypes([
                        "image/jpg",
                        "image/png",
                        "image/svg+xml",
                        "image/gif, image/jpeg",
                      ]);
                    }
                  }}
                  error={
                    formik.touched.fileType && Boolean(formik.errors.fileType)
                  }
                  MenuProps={{ classes: { paper: "globalDropdown" } }}
                >
                  <MenuItem
                    className={CustomSelectClasses.menuItemText}
                    value="image"
                  >
                    Image
                  </MenuItem>
                  <MenuItem
                    className={CustomSelectClasses.menuItemText}
                    value="video"
                  >
                    Video
                  </MenuItem>
                  <MenuItem
                    className={CustomSelectClasses.menuItemText}
                    value="audio"
                  >
                    Audio
                  </MenuItem>
                  <MenuItem
                    className={CustomSelectClasses.menuItemText}
                    value="vr"
                  >
                    3D Model
                  </MenuItem>
                </Select>
              </Box>
              <Box className={Classes.block}>
                <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                  Image, Video, Audio, or 3D Model
                </InputLabel>
                <Typography className={Classes.topCaption}>
                  550 x 550 recommended.
                </Typography>

                <Typography component="div">
                  <DragDropFileUpload
                    acceptedFiles={fileTypes}
                    handleImageChange={(files: any) =>
                      handleFileChangeUpload(files)
                    }
                    handleImageDrop={(files: any) => handleImageDrop(files)}
                  />
                </Typography>

                <Typography component="p" className={Classes.imageErrorMsg}>
                  {formik.errors.nftFile || ""}
                </Typography>
                <Typography className={Classes.bottomCaption}>
                  File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3,{" "}
                  <br /> WAV, OGG, GLB. Max size: 100 MB
                </Typography>
              </Box>

              {formik.values.fileType !== "image" && (
                <Box className={Classes.block}>
                  <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                    Preview Thumbnail Image
                  </InputLabel>
                  <Typography className={Classes.bottomCaption}>
                    Because you’ve included multimedia, you’ll need to provide
                    an image (PNG, JPG, or GIF) for the card display of your
                    item.
                  </Typography>
                  <Typography className={Classes.topCaption}>
                    550 x 550 recommended.
                  </Typography>

                  <Typography component="div">
                    <DragDropFileUpload
                      acceptedFiles={[
                        "image/jpg",
                        "image/png",
                        "image/gif",
                        "image/jpeg",
                      ]}
                      handleImageChange={(files: any) =>
                        handleThumbnailChangeUpload(files)
                      }
                      handleImageDrop={(files: any) =>
                        handleImageDropForThumbnail(files)
                      }
                    />
                  </Typography>

                  <Typography component="p" className={Classes.imageErrorMsg}>
                    {formik.errors.nftThumbnailFile || ""}
                  </Typography>
                </Box>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <InputLabel htmlFor="userName" className={Classes.inputLabel}>
                    Add NFT Attributes
                  </InputLabel>
                </Grid>
                <Grid item xs={5} md={5}>
                  <InputLabel htmlFor="Name" className={Classes.inputLabel}>
                    Title
                  </InputLabel>
                </Grid>
                <Grid item xs={5} md={5}>
                  <InputLabel htmlFor="Name" className={Classes.inputLabel}>
                    Description
                  </InputLabel>
                </Grid>
                {nftProperties.map((value, index) => (
                  <>
                    <Grid item xs={5} md={5}>
                      <TextField
                        fullWidth
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Shirt"
                        value={nftProperties[index].trait_type}
                        onChange={(e) =>
                          updateNftPropertiesTitle(e.target.value, index)
                        }
                        className={Classes.inputFormControl}
                        FormHelperTextProps={{
                          className: Classes.errorMsg,
                        }}
                      />
                    </Grid>
                    <Grid item xs={5} md={5}>
                      <TextField
                        fullWidth
                        type="text"
                        id="value"
                        name="value"
                        placeholder="Blue"
                        value={nftProperties[index].value}
                        onChange={(e) =>
                          updateNftPropertiesValue(e.target.value, index)
                        }
                        className={Classes.inputFormControl}
                        FormHelperTextProps={{
                          className: Classes.errorMsg,
                        }}
                      />
                    </Grid>
                    {index !== 0 && (
                      <Grid item xs={2} md={2}>
                        {/* <Button
                          onClick={() => removeNftProperties(index)}
                          variant="contained"
                          className={`gradientButton ${Classes.createCollection}`}
                        >
                          X<div className="fill-two"></div>
                        </Button> */}

                        <IconButton onClick={() => removeNftProperties(index)}>
                          <CloseIcon className={Classes.closeIcon} />
                        </IconButton>
                      </Grid>
                    )}
                  </>
                ))}
                {attributeMessage && (
                  <Typography component="p" className={Classes.addMoreText}>
                    To add new attributes title/description is required.
                  </Typography>
                )}
                {nftProperties.length <= 9 && (
                  <Grid item xs={6} md={6}>
                    <Button
                      onClick={addMoreProperties}
                      variant="contained"
                      className={`gradientButton ${Classes.createCollection}`}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faPlus}
                          className={Classes.plusIcon}
                        />
                      }
                    >
                      Add More
                      <div className="fill-two"></div>
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className={Classes.block}>
                <InputLabel htmlFor="Name" className={Classes.inputLabel}>
                  Name
                </InputLabel>
                <TextField
                  fullWidth
                  type="text"
                  id="name"
                  name="name"
                  value={formik.values.name.replace(/[^a-zA-Z0-9 #]/g, "")}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  className={Classes.inputFormControl}
                  FormHelperTextProps={{
                    className: Classes.errorMsg,
                  }}
                />
              </Box>

              {formik.values.fileType === "audio" && (
                <Box className={Classes.block}>
                  <InputLabel
                    htmlFor="artistName"
                    className={Classes.inputLabel}
                  >
                    Artist Name
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="text"
                    id="artistName"
                    value={formik.values.artistName.replace(
                      /[^a-zA-Z0-9 #]/g,
                      ""
                    )}
                    onChange={formik.handleChange}
                    className={Classes.inputFormControl}
                    error={
                      formik.touched.artistName &&
                      Boolean(formik.errors.artistName)
                    }
                    helperText={
                      formik.touched.artistName && formik.errors.artistName
                    }
                  />
                </Box>
              )}

              <Box className={Classes.block}>
                <InputLabel
                  htmlFor="description"
                  className={Classes.inputLabel}
                >
                  Description
                </InputLabel>
                <Typography
                  component="p"
                  className={Classes.blockCaption}
                  sx={{ margin: "10px 0" }}
                >
                  {formik?.values.description?.length} of 1000 characters used.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter Description Here"
                  id="description"
                  name="description"
                  className={Classes.TextAreaFormControl}
                  value={formik.values.description}
                  onChange={(e) =>
                    e.target.value?.length <= 1000 && formik.handleChange(e)
                  }
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Box>

              <Box className={Classes.block}>
                <InputLabel htmlFor="url" className={Classes.inputLabel}>
                  URL
                </InputLabel>
                <Typography
                  component="p"
                  className={Classes.blockCaption}
                  sx={{ margin: "10px 0" }}
                >
                  Any external link regarding NFT.
                </Typography>
                <TextField
                  fullWidth
                  type="url"
                  placeholder="https://domainname.com"
                  id="externalUrl"
                  name="externalUrl"
                  value={formik.values.externalUrl}
                  onChange={formik.handleChange}
                  className={Classes.inputFormControl}
                  error={
                    formik.touched.externalUrl &&
                    Boolean(formik.errors.externalUrl)
                  }
                  helperText={
                    formik.touched.externalUrl && formik.errors.externalUrl
                  }
                />
              </Box>
              <Grid
                item
                xs={12}
                component="div"
                className={Classes.actionsWrapper}
              >
                <Box className={Classes.block}>
                  <Button className={`${Classes.grayBtn} ${Classes.actionBtn}`}>
                    You Are Minting On:&nbsp;
                    <span style={{ fontFamily: "Visby CF Bold" }}>
                      {CHAIN_TITLE[currentUser?.chainType]}
                    </span>
                    <img
                      src={CHAIN_LOGOS[currentUser?.chainType]}
                      className={Classes.btnLogo}
                      alt="cardbadge"
                    />
                  </Button>
                </Box>
              </Grid>

              <Typography component="div">
                <FormGroup>
                  <FormControlLabel
                    sx={{ alignItems: "flex-start" }}
                    control={
                      <Checkbox
                        onChange={(e) => setTermsAndContition(e.target.checked)}
                        defaultChecked
                        sx={{ paddingTop: "0" }}
                        icon={<CustomUnMarkIcon />}
                        checkedIcon={<CustomMarkIcon />}
                      />
                    }
                    label={
                      <Typography component="div" className={Classes.agree}>
                        I agree to all terms and conditions of the PIQSOL web
                        platform and duly accept the entire copyright transfer
                        agreement included in the terms and conditions section
                        of the platform.
                      </Typography>
                    }
                  />
                </FormGroup>
              </Typography>
            </Grid>
          </Grid>

          <Typography component="div" className={Classes.footerAction}>
            <Tooltip title="Click the create nft button to mint your nft">
              <Button
                disabled={createLoading}
                type="submit"
                variant="contained"
                className={`gradientButton ${Classes.createCollection}`}
              >
                {createLoading ? "Minting" : "Create NFT"}
                {createLoading && (
                  <CircularProgress
                    style={{ color: "white", marginLeft: 10 }}
                    size={16}
                  />
                )}
                <div className="fill-two"></div>
              </Button>
            </Tooltip>
            {createLoading && (
              <Typography
                sx={{ color: "var(--text-color)" }}
                className="warning-msg"
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="color-red"
                />{" "}
                Minting in progress, don't close the window.
              </Typography>
            )}
          </Typography>
        </form>
      </Box>
    </Container>
  );
};

export default CreateNft;
