import React from "react";
import { Container, Box } from "@mui/material";

import Coindoo from "../../assets/images/brands/coindoo.png";
import Blockzodiac from "../../assets/images/brands/blockzodiac.png";
import Logoyahoo from "../../assets/images/brands/logoyahoo.png";
import Marketwatch from "../../assets/images/brands/marketwatch.png";
import Thetechly from "../../assets/images/brands/thetechly.png";

import Classes from "../../style/home/Brands.module.scss";

function Brands() {
  return (
    <>
      <Container>
        <Box className={`animate__animated animate__zoomIn ${Classes.brands}`}>
          <img loading="lazy" src={Coindoo} alt="Coindoo" />

          <img loading="lazy" src={Blockzodiac} alt="Blockzodiac" />

          <img loading="lazy" src={Logoyahoo} alt="logoyahoo" />

          <img loading="lazy" src={Marketwatch} alt="marketwatch" />

          <img loading="lazy" src={Thetechly} alt="thetechly" />
        </Box>
      </Container>
    </>
  );
}

export default Brands;
