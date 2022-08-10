import * as React from "react";
import { Typography, Container } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faArrowRightLong,
} from "@fortawesome/free-solid-svg-icons";
import ArticleCard from "components/common/ArticleCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Classes from "../../style/home/Blog.module.scss";
import { getBlogs } from '../../store/reducers/blogReducer'
import { useDispatch , useSelector } from "react-redux";


const Similarblogs = () => {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    cssEase: "linear",
    nextArrow: <FontAwesomeIcon icon={faArrowRightLong} />,
    prevArrow: <FontAwesomeIcon icon={faArrowLeftLong} />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 980,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const dispatch = useDispatch();

  const fetchBlogs = async () => {
    await dispatch(getBlogs())
    }

    React.useEffect(() => {
    fetchBlogs();
} , [])


const blogData = useSelector((state: any) => state.blogReducer.blogs);
  return (
    <>
      <Container
        sx={{ pt: 6, pb: 7 }}
        className={`similarBlogSlider ${Classes.blogSection} carousel-with-arrows`}
      >
        <Typography variant="h6" className={`VisbyExtrabold ${Classes.heading}`}>
          Other similar posts
        </Typography>

        <Slider {...settings}>
          {blogData?.length && blogData.map((article, index) => (
            <div key={index} className={Classes.slideStart}>
             <ArticleCard data={article} />
             </div>
          ))}
        </Slider>
      </Container>
    </>
  );
};

export default Similarblogs;
