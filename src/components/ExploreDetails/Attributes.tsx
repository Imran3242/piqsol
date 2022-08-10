import * as React from "react";
// Material Ui Components
import { Typography } from "@mui/material";

import CardBox from "./CardBox";
import Classes from "style/Explore/Attributes.module.scss";

const Attributes = ({ attributes }: any) => {
  return (
    <CardBox className={Classes.attributesWrapper}>
      <Typography component="h4" className={Classes.title}>
        Attributes
      </Typography>
      <Typography component="div" className={Classes.attributesItems}>
        {attributes.map((attribue: any) => (
          <Typography component="div" className={Classes.attributesItem}>
            <Typography component="p" className={Classes.attributeName}>
              {attribue?.trait_type}
            </Typography>
            <Typography component="p" className={Classes.attributeDetail}>
              {attribue?.value}
            </Typography>
          </Typography>
        ))}
      </Typography>
    </CardBox>
  );
};

export default Attributes;
