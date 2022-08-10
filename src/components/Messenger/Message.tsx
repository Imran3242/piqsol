import React from "react";
import { Typography, Box } from "@mui/material";
import Classes from "../../style/Messenger/Message.module.scss";

const Message = (props: { data: any; sender: any }) => {
  const { sender, data } = props;
  const files = data?.files ? JSON.parse(data?.files) : [];
  return (
    <Box
      key={data?._id}
      className={sender ? Classes.senderMessage : Classes.receiverMessage}
    >
      <Typography
        component="div"
        className={Classes.message}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {data?.content}

        {files && (
          <Typography
            style={{ display: "grid", gridTemplateColumns: "auto auto auto" }}
          >
            {files?.map((row: any, index: number) => (
              <a href={row} target="_blank" style={{ margin: "0.3rem" }}>
                <img  loading='lazy' src={row} style={{ width: "10rem" }} />
              </a>
            ))}
          </Typography>
        )}
      </Typography>
    </Box>
  );
};

export default Message;
