import * as React from "react";
import { Typography, Container } from "@mui/material";

import Classes from "../../style/home/Video.module.scss";

const Video = () => {
  return (
    <div className={Classes.Video}>
      <Container className="carousel-with-arrows">
        <Typography
          variant="h6"
          className={`VisbyExtrabold ${Classes.heading}`}
        >
          How Piqsol Works
        </Typography>

        <iframe
          width="1080"
          height="596"
          src="https://www.youtube.com/embed/Y0VochQIKWQ"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </Container>
    </div>
  );
};

export default Video;
