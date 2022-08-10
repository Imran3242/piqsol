import * as React from "react"

import { Typography, Box } from "@mui/material"

import Classes from "../../style/home/DiscoverMore.module.scss"
import Marquee from "react-fast-marquee"

import { ReactComponent as ArrowUpRight } from "../../assets/icons/SVG/ArrowUpRight.svg"

const DiscoverMore = () => {
  return (
    <div className={Classes.DiscoverMore}>
      <Marquee speed={50} gradient={false}>
        <Box className={Classes.dicoverSection}>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyBold ${Classes.stroke} ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyHeavy ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyBold ${Classes.stroke} ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyHeavy ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>

          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyBold ${Classes.stroke} ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyHeavy ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyBold ${Classes.stroke} ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyHeavy ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyBold ${Classes.stroke} ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
          <Box className={Classes.card}>
            <Typography
              component="div"
              className={`VisbyHeavy ${Classes.name}`}
            >
              Discover more
            </Typography>
            <ArrowUpRight className={Classes.arrowIcon} />
          </Box>
        </Box>
      </Marquee>
    </div>
  )
}

export default DiscoverMore
