import React, { useRef, useEffect } from "react";
import { Typography, Box, Link, Divider } from "@mui/material";
import Classes from "style/Explore/OverViewTabContent.module.scss";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import { PDFExport } from "@progress/kendo-react-pdf";
import logo from "../../assets/images/logo-footer.png";
import moment from "moment";
import pdfStyles from "./styles/pdfFont.module.css";
import NotificationSound from "../../assets/audio/notification-sound.mp3";

import {
  setIsOpen,
  setIsSuccess,
  setMessage,
} from "store/reducers/errorSuccessMessageReducer";
import { useDispatch } from "react-redux";

const PDFExportPageTemplate = (props) => (
  <span style={{ textAlign: "center" }}>
    Page {props.pageNum} of {props.totalPages}
  </span>
);

export default function DocumentTabContent({
  nftDetails,
}: {
  nftDetails: any;
}) {
  const pdfExportComponent = React.useRef<PDFExport>(null);
  const creator = nftDetails?.creators ? nftDetails?.creators : [];
  const audioPlayer = useRef(null);
  const dispatch = useDispatch();

  const [alertMessage, setAlertMessage] = React.useState<any>({
    open: false,
    type: "success",
    message: "",
  });

  const alertHandleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertMessage(false);
  };

  useEffect(() => {
    if (alertMessage?.open) {
      audioPlayer.current.play();
    }
  }, [alertMessage?.open]);

  return (
    <Box className={Classes.tableWrapper}>
      {nftDetails && (
        <>
          <Typography component="div" className={Classes.row}>
            <Typography component="div" className={Classes.item}>
              NFT File Info
            </Typography>
            <Typography component="div" className={Classes.item}>
              <Link
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                href="#"
                onClick={() => {
                  if (pdfExportComponent.current) {
                    pdfExportComponent.current.save();

                    dispatch(setMessage("NFT details document downloaded."));
                    dispatch(setIsOpen(true));
                    dispatch(setIsSuccess(true));
                  }
                }}
              >
                <CloudDownloadOutlinedIcon sx={{ fontSize: "20px" }} />
                <span>Download</span>
              </Link>
            </Typography>
          </Typography>
          {nftDetails && (
            <Box className={Classes.copyrightsDataWrapper}>
              <Typography component="h1" className={Classes.titleItem}>
                Copyrights
              </Typography>
              <Typography component="div">
                {(nftDetails?.creatorNftRights?.publicDisplayOrStreamArtWork ||
                  nftDetails?.creatorNftRights?.digitalReproduction ||
                  nftDetails?.creatorNftRights?.physicalReproductionRights ||
                  nftDetails?.creatorNftRights?.physicalReproductionRights) && (
                  <>
                    <div>
                      <Typography component="h3" className={Classes.subtitle}>
                        The Creator of this NFT confirms to have the following
                        rights:
                      </Typography>

                      <ul className={Classes.listWrapper}>
                        {nftDetails?.creatorNftRights
                          ?.publicDisplayOrStreamArtWork && (
                          <li>
                            I confirm to own/have expressly obtained from the
                            creator of the artworks the copyrights necessary for
                            the Public display and/or streaming of the NFT
                            associated artworks.
                          </li>
                        )}

                        {nftDetails?.creatorNftRights?.digitalReproduction && (
                          <li>
                            I confirm to be the artist/creator of the selected
                            artwork(s) and/or to own/have expressly obtained
                            from the creator the copyrights necessary for the
                            digital reproduction of the selected artworks and
                            their display within the PIQSOL ecosystem.
                          </li>
                        )}

                        {nftDetails?.creatorNftRights
                          ?.physicalReproductionRights && (
                          <li>
                            I confirm that I own the physical reproduction
                            rights for all of the selected artwork(s).
                          </li>
                        )}

                        {nftDetails?.creatorNftRights
                          ?.digitalCommercialization && (
                          <li>
                            I confirm to own the digital commercialization
                            rights for the selected artwork(s).
                          </li>
                        )}
                      </ul>
                    </div>
                    <Divider sx={{ marginBottom: "10px" }} />
                  </>
                )}

                <Typography component="h3" className={Classes.subtitle}>
                  Display / Streaming Rights Granted:
                </Typography>
                <ul className={Classes.listWrapper}>
                  {nftDetails?.displayStreaming?.piqsolEcosystem && (
                    <li>
                      Stream the associated artwork(s) on the piqsol ecosystem
                    </li>
                  )}

                  {nftDetails?.displayStreaming?.privatePurposes && (
                    <li>
                      Stream the associated artwork(s) anywhere for private
                      purposes.
                    </li>
                  )}

                  {nftDetails?.displayStreaming?.commercialPurposes && (
                    <li>
                      Stream the associated artwork(s) anywhere for commercial
                      purposes.
                    </li>
                  )}
                </ul>
              </Typography>
              <Divider sx={{ marginBottom: "10px" }} />

              <div>
                <Typography component="h3" className={Classes.subtitle}>
                  Physical Reproduction Rights Granted:
                </Typography>

                <ul className={Classes.listWrapper}>
                  {nftDetails?.physicalReproduction?.noReproduction && (
                    <li>No physical reproductions.</li>
                  )}

                  {nftDetails?.physicalReproduction?.privatePurposes && (
                    <li>Create physical reproductions for private purpose.</li>
                  )}

                  {nftDetails?.physicalReproduction?.oneCommercialPurposes && (
                    <li>
                      Create one physical reproduction for commercial purposes.
                    </li>
                  )}

                  {nftDetails?.physicalReproduction
                    ?.multipleCommercialPurposes && (
                    <li>
                      Create multiple physical reproduction for commercial
                      purposes.
                    </li>
                  )}
                </ul>
              </div>

              <Divider sx={{ marginBottom: "10px" }} />
            </Box>
          )}
        </>
      )}
      <div
        className={Classes.pdfContent}
        style={{
          position: "absolute",
          top: "-20000px",
        }}
      >
        <PDFExport
          margin="1cm"
          pageTemplate={PDFExportPageTemplate}
          fileName={"piqsol-" + moment() + ".pdf"}
          ref={pdfExportComponent}
        >
          <div className={pdfStyles.div}>
            {nftDetails && (
              <div>
                <div className={Classes.logo}>
                  <img src={logo} alt="Logo" />
                </div>

                {nftDetails?.nftType === "Fraction" && (
                  <div>
                    <h4>Main NFT Information</h4>
                    <table>
                      <tbody>
                        <tr>
                          <td className="VisbyExtrabold">
                            <div className="VisbyExtrabold">Main NFT Image</div>
                          </td>
                          <td>
                            <img
                              style={{ width: "100px" }}
                              src={nftDetails?.parentId?.image}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="VisbyExtrabold">Main NFT name</div>
                          </td>
                          <td>
                            <div>{nftDetails?.parentId?.name}</div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="VisbyExtrabold">Description</div>
                          </td>
                          <td>
                            <div>{nftDetails?.parentId?.description}</div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="VisbyExtrabold">Mint</div>
                          </td>
                          <td>
                            <div>{nftDetails?.parentId?.mint}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <h4 style={{ textTransform: "uppercase" }}>
                  {nftDetails?.nftType === "Fraction"
                    ? "Fractional NFT information"
                    : "NFT Information"}
                </h4>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">Creator</div>
                      </td>
                      <td>
                        <div>{creator?.length > 0 && creator[0]?.address}</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">Title</div>
                      </td>
                      <td>
                        <div>{nftDetails?.name}</div>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className="VisbyExtrabold">
                          {nftDetails?.nftType === "Fraction"
                            ? "Fractional NFT"
                            : "Main NFT"}
                        </div>
                      </td>
                      <td>
                        <img
                          style={{ width: "100px" }}
                          src={nftDetails?.image}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">Description</div>
                      </td>
                      <td>
                        <div>{nftDetails?.description}</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">Mint</div>
                      </td>
                      <td>
                        <div>{nftDetails?.mint}</div>
                      </td>
                    </tr>
                    {nftDetails?.nftType === "Fraction" && (
                      <tr>
                        <td>
                          <div className="VisbyExtrabold">
                            Fractional block number
                          </div>
                        </td>
                        <td>
                          <div>{`${nftDetails?.fractionedIndex + 1}/${
                            nftDetails?.parentId?.activeAuction?.noOfFractions
                          }`}</div>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">Blockchain</div>
                      </td>
                      <td>
                        <div>{nftDetails?.blockchainType}</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">
                          Current Owner's Wallet Address
                        </div>
                      </td>
                      <td>
                        <div>{nftDetails?.userId?.walletAddress}</div>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className="VisbyExtrabold">Original Creator</div>
                      </td>
                      <td>
                        <div>
                          {creator?.length > 0 &&
                          creator?.filter(
                            (c: any) =>
                              c?.address === nftDetails?.userId?.walletAddress
                          ).length > 0
                            ? "true"
                            : "false"}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">Date of Creation</div>
                      </td>
                      <td>
                        <div>
                          {moment(nftDetails?.createdAt).format("DD-MM-YYYY")}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="VisbyExtrabold">View NFT Url</div>
                      </td>
                      <td>
                        <div>
                          {`https://piqsol.invo.zone/explore/explore-details/${nftDetails?._id}`}
                        </div>
                      </td>
                    </tr>
                    <tr></tr>
                  </tbody>
                </table>

                {nftDetails && (
                  <div>
                    <h3
                      style={{ fontWeight: "bold", textTransform: "uppercase" }}
                    >
                      Copyrights
                    </h3>
                    {(nftDetails?.creatorNftRights
                      ?.publicDisplayOrStreamArtWork ||
                      nftDetails?.creatorNftRights?.digitalReproduction ||
                      nftDetails?.creatorNftRights
                        ?.physicalReproductionRights ||
                      nftDetails?.creatorNftRights
                        ?.physicalReproductionRights) && (
                      <>
                        {" "}
                        <div>
                          <h4>
                            The Creator of this NFT confirms to have the
                            following rights:
                          </h4>

                          {nftDetails?.creatorNftRights
                            ?.publicDisplayOrStreamArtWork && (
                            <p>
                              I confirm to own/have expressly obtained from the
                              creator of the artworks the copyrights necessary
                              for the Public display and/or streaming of the NFT
                              associated artworks.
                            </p>
                          )}

                          {nftDetails?.creatorNftRights
                            ?.digitalReproduction && (
                            <p>
                              I confirm to be the artist/creator of the selected
                              artwork(s) and/or to own/have expressly obtained
                              from the creator the copyrights necessary for the
                              digital reproduction of the selected artworks and
                              their display within the PIQSOL ecosystem.
                            </p>
                          )}

                          {nftDetails?.creatorNftRights
                            ?.physicalReproductionRights && (
                            <p>
                              I confirm that I own the physical reproduction
                              rights for all of the selected artwork(s).
                            </p>
                          )}

                          {nftDetails?.creatorNftRights
                            ?.digitalCommercialization && (
                            <p>
                              I confirm to own the digital commercialization
                              rights for the selected artwork(s).
                            </p>
                          )}
                        </div>
                        <Divider sx={{ marginBottom: "20px" }} />
                      </>
                    )}

                    <div>
                      <h4>Display / Streaming Rights Granted:</h4>
                      {nftDetails?.displayStreaming?.piqsolEcosystem && (
                        <p>
                          Stream the associated artwork(s) on the piqsol
                          ecosystem
                        </p>
                      )}

                      {nftDetails?.displayStreaming?.privatePurposes && (
                        <p>
                          Stream the associated artwork(s) anywhere for private
                          purposes.
                        </p>
                      )}

                      {nftDetails?.displayStreaming?.commercialPurposes && (
                        <p>
                          Stream the associated artwork(s) anywhere for
                          commercial purposes.
                        </p>
                      )}
                    </div>
                    <Divider sx={{ marginBottom: "20px" }} />

                    <div>
                      <h4>Physical Reproduction Rights Granted:</h4>

                      {nftDetails?.physicalReproduction?.noReproduction && (
                        <p>No physical reproductions.</p>
                      )}

                      {nftDetails?.physicalReproduction?.privatePurposes && (
                        <p>
                          Create physical reproductions for private purpose.
                        </p>
                      )}

                      {nftDetails?.physicalReproduction
                        ?.oneCommercialPurposes && (
                        <p>
                          Create one physical reproduction for commercial
                          purposes.
                        </p>
                      )}

                      {nftDetails?.physicalReproduction
                        ?.multipleCommercialPurposes && (
                        <p>
                          Create multiple physical reproduction for commercial
                          purposes.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Divider />

            <p className={pdfStyles.copyrightSection}>
              Copyright © 2022 Piqsol Inc. All rights reserved. All copyrights
              and trademarks of the character images used belong to their
              respective owners.
            </p>
          </div>
        </PDFExport>
      </div>

      <audio ref={audioPlayer} src={NotificationSound} />
    </Box>
  );
}
