import * as React from "react";
import { Link } from "react-router-dom";

import { Typography, Box, Container, Grid, Button } from "@mui/material";

import StreamlineArrowRightWhite from "../../assets/icons/streamline-icon-arrow-corner-right-white.svg";

import Classes from "../../style/home/Blog.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { getBlogs } from "store/reducers/blogReducer";
import ArtcleCard from "../common/ArticleCard";

const Blog = () => {
  const dispatch = useDispatch();

  const fetchBlogs = async () => {
    await dispatch(getBlogs());
  };

  React.useEffect(() => {
    fetchBlogs();
  }, []);

  const blogsData = useSelector((state: any) => state?.blogReducer?.blogs?.slice(0, 3) || []);

  return (
    <>
      <Container className={`animate__animated animate__zoomIn ${Classes.blogSection}`}>
        <Typography variant="h6" className={`VisbyExtrabold ${Classes.heading}`}>
          Resources to get started
        </Typography>
        <Grid container spacing={3}>
          {blogsData.map((article, index) => (
              <ArtcleCard key={index} data={article} />           
          ))}
        </Grid>
        <Box className={Classes.bottom}>
          <Link to="/resources">
            <Button
              variant="contained"
              className={`button btn-bg-purple VisbyBold`}
              endIcon={<img src={StreamlineArrowRightWhite} alt="StreamlineArrowRight" />}
            >
              See All Blogs
            </Button>
          </Link>
        </Box>
      </Container>
    </>
  );
};

export default Blog;
