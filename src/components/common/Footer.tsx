import * as React from "react";
import { Link } from "react-router-dom";

import {
  Container,
  Grid,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Tooltip,
} from "@mui/material";
import twitter from "../../assets/icons/twitter.png";
import instagram from "../../assets/icons/instagram.png";
import discord from "../../assets/icons/discord-footer.png";
import message from "../../assets/icons/message.png";
import StreamlineArrowRight from "../../assets/icons/streamline-icon-arrow-corner-right.svg";
import { useWallet } from "@solana/wallet-adapter-react";
import Classes from "../../style/Common/Footer.module.scss";
import TelegramIcon from "@mui/icons-material/Telegram";
import FacebookIcon from "@mui/icons-material/Facebook";

import { ReactComponent as ArrowUpRight } from "../../assets/icons/SVG/ArrowUpRight.svg";
import { useSelector } from "react-redux";
import { authSelector } from "store/reducers/authReducer";

const martketplace = [
  { title: "All NFT’s", to: "/explore" },
  { title: "New", to: "/explore" },
  { title: "Art", to: "/explore" },
  { title: "Domains", to: "/explore" },
  { title: "Virtual Worlds", to: "/explore" },
  { title: "Trading Cards", to: "/explore" },
];
const myAccount = [
  { title: "My Profile", to: "/profile/myCollected" },
  { title: "My Wallet", to: "/profile/myWallet" },
  { title: "Favorites", to: "/profile/myFavorited" },
  { title: "My Collections", to: "/profile/myCreated" },
  { title: "Rankings", to: "/ranking" },
  { title: "Settings", to: "/settings" },
];

const Footer = () => {
  const wallet = useWallet();
  const states = useSelector(authSelector).authReducer;

  return (
    <Box className={Classes.footer}>
      <Container>
        {!wallet.connected && !states?.isAuth && (
          <Box className={Classes.getStarted}>
            <Box>
              <Typography variant="h2">
                Buy, Sell, or Fractionally Mint
              </Typography>
              <Typography>
                Discover a world of wonder on our platform, where each aspect
                has been developed <br /> with you in mind. We bring NFT
                ownership to the masses.
              </Typography>
            </Box>
            <Box>
              <Link to="/explore">
                <Button
                  variant="contained"
                  className={`button btn-bg-green`}
                  endIcon={
                    <img
                      src={StreamlineArrowRight}
                      alt="StreamlineArrowRight"
                    />
                  }
                >
                  Explore Now
                </Button>
              </Link>
            </Box>
          </Box>
        )}
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Box className={Classes.logoSection}>
                <div className={Classes.footerLogo}></div>
                <Box className={Classes.socialCommunity}>
                  <Typography variant="h5">Join Our Community</Typography>
                  <List>
                    <a href="https://twitter.com/Piqsol">
                      <ListItem>
                        <img loading="lazy" src={twitter} alt="twitter" />
                      </ListItem>
                    </a>
                    <a href="https://www.instagram.com/piqsol.art/">
                      <ListItem>
                        <img loading="lazy" src={instagram} alt="instagram" />
                      </ListItem>
                    </a>
                    <a href="https://web.facebook.com/piqsol?_rdc=1&_rdr">
                      <ListItem>
                        <FacebookIcon />
                      </ListItem>
                    </a>
                    <a href="https://t.me/Piqsol">
                      <ListItem>
                        <TelegramIcon />
                      </ListItem>
                    </a>
                    <a href="https://discord.com/invite/piqsol">
                      <ListItem>
                        <img loading="lazy" src={discord} alt="Discord" />
                      </ListItem>
                    </a>
                    <a href="mailto:info@piqsol.com">
                      <ListItem>
                        <img loading="lazy" src={message} alt="Message" />
                      </ListItem>
                    </a>
                  </List>
                </Box>
                <Typography className={Classes.copyright}>
                  Copyright © 2022 Piqsol Inc. All rights reserved. <br></br>
                  <Link to="/privacy-policy">Privacy Policy</Link> |{" "}
                  <Link to="/terms-and-conditions">Terms & Conditions</Link> |{" "}
                  <Link to="/nft-agreement">NFT Agreement</Link>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="h5">Marketplace</Typography>
                  <List>
                    {martketplace.map((item, index) => (
                      <Link key={index} to={item.to}>
                        {item.title == "Domains" ||
                        item.title == "Virtual Worlds" ||
                        item.title == "Trading Cards" ? (
                          <Tooltip title="Coming Soon">
                            <ListItem>
                              <ArrowUpRight className={Classes.arrowIcon} />
                              <ListItemText className={Classes.itemText}>
                                {item.title}
                              </ListItemText>
                            </ListItem>
                          </Tooltip>
                        ) : (
                          <ListItem>
                            <ArrowUpRight className={Classes.arrowIcon} />
                            <ListItemText className={Classes.itemText}>
                              {item.title}
                            </ListItemText>
                          </ListItem>
                        )}
                      </Link>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="h5">Resources</Typography>
                  <List>
                    <a href="https://discord.gg/piqsol">
                      <ListItem>
                        <ArrowUpRight className={Classes.arrowIcon} />
                        <ListItemText className={Classes.itemText}>
                          Help Center
                        </ListItemText>
                      </ListItem>
                    </a>
                    <a href="https://form.jotform.com/220904472682558">
                      <ListItem>
                        <ArrowUpRight className={Classes.arrowIcon} />
                        <ListItemText className={Classes.itemText}>
                          Whitelist
                        </ListItemText>
                      </ListItem>
                    </a>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSffkxkCVoComCxulIdfgoBLwz-W2Z8MEUma9a03_B9ezkDsQQ/viewform">
                      <ListItem>
                        <ArrowUpRight className={Classes.arrowIcon} />
                        <ListItemText className={Classes.itemText}>
                          Partners
                        </ListItemText>
                      </ListItem>
                    </a>
                    <a href="mailto:social@piqsol.com">
                      <ListItem>
                        <ArrowUpRight className={Classes.arrowIcon} />
                        <ListItemText className={Classes.itemText}>
                          Suggestions
                        </ListItemText>
                      </ListItem>
                    </a>
                    <a href="https://discord.com/invite/piqsol">
                      <ListItem>
                        <ArrowUpRight className={Classes.arrowIcon} />
                        <ListItemText className={Classes.itemText}>
                          Discord Community
                        </ListItemText>
                      </ListItem>
                    </a>
                    <Link to="/resources">
                      <ListItem>
                        <ArrowUpRight className={Classes.arrowIcon} />
                        <ListItemText className={Classes.itemText}>
                          Docs
                        </ListItemText>
                      </ListItem>
                    </Link>
                  </List>
                </Grid>

                {states.isAuth && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="h5">My Account</Typography>
                    <List>
                      {myAccount.map((item, index) => (
                        <Link key={index} to={item.to}>
                          <ListItem>
                            <ArrowUpRight className={Classes.arrowIcon} />
                            <ListItemText className={Classes.itemText}>
                              {item.title}
                            </ListItemText>
                          </ListItem>
                        </Link>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
