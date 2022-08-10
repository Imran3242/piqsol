import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { AnimationOnScroll } from 'react-animation-on-scroll';

import Classes from '../../style/home/CreateNft.module.scss';

function CreateNft() {
  return (
    <div className={`${Classes.homeNftSection}`}>
      <Container>
        <Box className={Classes.CreateNft}>
          <Typography variant="h6" className={`VisbyExtrabold ${Classes.heading}`}>
            Buy, Sell And Create NFTs
          </Typography>
          <Typography className={Classes.description}>
            Whether you are a newbie or a professional, Piqsol is your new home
            for a world amazing NFTs. <br /> So let's get started, what are you
            waiting for?
          </Typography>

          <Box className={Classes.section}>
            <AnimationOnScroll
              animateOnce={true}
              animateIn="animate__zoomIn"
              className={Classes.card}
            >
              <Typography className={`${Classes.number}`}>
                <span className={Classes.digits}>01</span>
                <span className={Classes.circle}></span>
              </Typography>
              <Typography className={`${Classes.title}`}>
                Set up your wallet
              </Typography>
              <Typography className={`${Classes.desc}`}>
                There are some really good desktop wallets for Solana. DYOR and
                decide which best suits you. Once you’ve set up your wallet of
                choice, connect it to PIQSOL by clicking the wallet icon in the
                top right corner.
              </Typography>
            </AnimationOnScroll>
            <AnimationOnScroll
              delay={500}
              animateOnce={true}
              animateIn="animate__zoomIn"
              className={Classes.card}
            >
              <Typography className={`${Classes.number}`}>
              <span className={Classes.digits}>02</span>
                <span className={`${Classes.circle} ${Classes.right}`}></span>
              </Typography>
              <Typography className={`${Classes.title}`}>
                Create Collections
              </Typography>
              <Typography className={`${Classes.desc}`}>
                Click My Collections in the upper right of the website and set
                up your collection. Add your social links, a cool description,
                good quality profile & banner images, and set your fees.
              </Typography>
            </AnimationOnScroll>
            <AnimationOnScroll
              delay={1000}
              animateOnce={true}
              animateIn="animate__zoomIn"
              className={Classes.card}
            >
              <Typography className={`${Classes.number}`}>
              <span className={Classes.digits}>03</span>
                <span className={Classes.circle}></span>
              </Typography>
              <Typography className={`${Classes.title}`}>
                Thoughtfully Designed
              </Typography>
              <Typography className={`${Classes.desc}`}>
                We spent many months making sure that the user experience is
                both pleasurable and memorable. If you have suggestions to
                improve on what we have done, please let us know.
              </Typography>
            </AnimationOnScroll>
            <AnimationOnScroll
              animateOnce={true}
              animateIn="animate__zoomIn"
              className={Classes.card}
            >
              <Typography className={`${Classes.number}`}>
              <span className={Classes.digits}>04</span>
                <span className={Classes.circle}></span>
              </Typography>
              <Typography className={`${Classes.title}`}>
                Add your NFTs
              </Typography>
              <Typography className={`${Classes.desc}`}>
                Piqsol supports various nft types. Upload your original work
                (image, video, audio, or 3D art), add a title and description,
                and customize your NFTs with properties, copyright licenses, and
                if fractional, the applicable F-NFT content.
              </Typography>
            </AnimationOnScroll>
            <AnimationOnScroll
              delay={500}
              animateOnce={true}
              animateIn="animate__zoomIn"
              className={Classes.card}
            >
              <Typography className={`${Classes.number}`}>
              <span className={Classes.digits}>05</span>
                <span className={`${Classes.circle} ${Classes.right}`}></span>
              </Typography>
              <Typography className={`${Classes.title}`}>
                Privacy First
              </Typography>
              <Typography className={`${Classes.desc}`}>
                We take privacy very seriously and promise to never use your
                personal information in any way that does not fully comply with
                our privacy policy.
              </Typography>
            </AnimationOnScroll>
            <AnimationOnScroll
              delay={1000}
              animateOnce={true}
              animateIn="animate__zoomIn"
              className={Classes.card}
            >
              <Typography className={`${Classes.number}`}>
              <span className={Classes.digits}>06</span>
                <span className={Classes.circle}></span>
              </Typography>
              <Typography className={`${Classes.title}`}>
                List them for Sale
              </Typography>
              <Typography className={`${Classes.desc}`}>
                Choose between buy now, an auction, or fractional nft -price
                listings. You choose exactly how you want to sell your NFTs, and
                we help you quickly sell them the best way possible.
              </Typography>
            </AnimationOnScroll>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default CreateNft;
