import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useDispatch, useSelector } from "react-redux";

import Banner1 from "../assets/images/resources-banner-1.png";
import {
  Typography,
  Box,
  Container,
  Grid,
  Pagination,
  Stack,
} from "@mui/material";

import Classes from "style/Resources/Resources.module.scss";
import {
  getBlogs,
  getBlogsCollectionCount,
} from "../store/reducers/blogReducer";

const exclusiveHeadcare = require("../assets/images/exclusive-headcare.png");
import { Link, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import draftToHtml from "draftjs-to-html";
import ArtcleCard from "../components/common/ArticleCard";
import ScrollToTop from "./ScrollToTop";
const Resources = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [count, setCount] = useState(null);

  const fetchBlogs = async () => {
    await dispatch(getBlogs(page, pageSize));
    const count: any = await dispatch(getBlogsCollectionCount());
    setCount(Math.ceil(count / pageSize));
  };

  useEffect(() => {
    fetchBlogs();
  }, [page]);
  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const blogData = useSelector((state: any) => state.blogReducer.blogs);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <>
      <ScrollToTop />
      <Container>
        <Box className={Classes.resources}>
          <Box className={Classes.slideshow}>
            <Slider {...settings}>
              <div>
                <img src={Banner1} alt="Resoures Banner" />
              </div>
              <div>
                <h3>2</h3>
              </div>
              <div>
                <h3>3</h3>
              </div>
              <div>
                <h3>4</h3>
              </div>
              <div>
                <h3>5</h3>
              </div>
            </Slider>
          </Box>

          <Grid container spacing={3} sx={{ marginBottom: "50px" }}>
            {blogData?.length > 0 &&
              blogData.map((article: any, index) => (
                <ArtcleCard key={index} data={article} />
              ))}
          </Grid>

          <Grid container>
            <Grid item xs={12}>
              <Stack spacing={2} className={Classes.articlePagination}>
                {count > 9 && (
                  <Pagination
                    onChange={handleChange}
                    count={count}
                    color="primary"
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Resources;
