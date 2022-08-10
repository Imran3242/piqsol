import React from "react";
import { useNavigate } from "react-router-dom";

import { Typography, Box, Grid } from "@mui/material";
import parse from "html-react-parser";
import draftToHtml from "draftjs-to-html";

import Classes from "../../style/Common/ArticleCard.module.scss";

export default function ArticleCard(props: { data?: any }) {
  const navigate = useNavigate();

  return (
    <Grid item xs={12} md={4}>
      <Box
        onClick={() => {
          navigate(`/blogSinglepage/${props?.data?._id}`);
        }}
        className={`"radius14" ${Classes.articleCard}`}
      >
        <img loading='lazy' src={props?.data?.image} alt={props?.data?.heading} />
        <Box className={Classes.descriptionBox}>
          <Typography variant="h6" className="VisbyBold">
            {props?.data?.heading}
          </Typography>
          <Typography className={Classes.description}>
            {parse(draftToHtml(JSON.parse(props?.data?.description)))}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );
}
