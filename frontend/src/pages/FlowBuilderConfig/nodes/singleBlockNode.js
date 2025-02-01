import {
  AccessTime,
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Image,
  LibraryBooks,
  Message,
  MicNone,
  Videocam
} from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Typography } from "@mui/material";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  return (
    <div
      style={{
        backgroundColor: "#FEFAFA",
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid rgba(236, 88, 88, 0.25)",
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 3px 5px"
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{
          background: "#0000FF",
          width: "18px",
          height: "18px",
          top: "20px",
          left: "-12px",
          cursor: 'pointer'
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffff",
            width: "10px",
            height: "10px",
            marginLeft: "3.5px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 5,
          top: 5,
          cursor: "pointer",
          gap: 6
        }}
      >
        <ContentCopy
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("duplicate");
          }}
          sx={{ width: "12px", height: "12px", color: "#EC5858" }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ width: "12px", height: "12px", color: "#EC5858" }}
        />
      </div>
      <div
        style={{
          color: "#ededed",
          fontSize: "16px",
          flexDirection: "row",
          display: "flex"
        }}
      >
        <LibraryBooks
          sx={{
            width: "16px",
            height: "16px",
            marginRight: "4px",
            marginTop: "4px",
            color: "#EC5858"
          }}
        />
        <div style={{ color: "#232323", fontSize: "16px" }}>Conteúdo</div>
      </div>
      <div style={{ color: "#232323", fontSize: "12px", width: 180 }}>
        {data.seq.map(item => (
          <div
            style={{
              backgroundColor: "#F6EEEE",
              marginBottom: "3px",
              borderRadius: "5px"
            }}
          >
            {item.includes("message") && (
              <div style={{ gap: "5px", padding: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    flexDirection: "row",
                    justifyContent: "center"
                  }}
                >
                  <Message sx={{ color: "#EC5858" }} />
                </div>
                <Typography
                  textAlign={"center"}
                  sx={{
                    textOverflow: "ellipsis",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                  }}
                >
                  {
                    data.elements.filter(itemLoc => itemLoc.number === item)[0]
                      .value
                  }
                </Typography>
              </div>
            )}
            {item.includes("interval") && (
              <div style={{ gap: "5px", padding: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    flexDirection: "row",
                    justifyContent: "center"
                  }}
                >
                  <AccessTime sx={{ color: "#EC5858" }} />
                </div>
                <Typography
                  textAlign={"center"}
                  sx={{
                    textOverflow: "ellipsis",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                  }}
                >
                  {
                    data.elements.filter(itemLoc => itemLoc.number === item)[0]
                      .value
                  }{" "}
                  segundos
                </Typography>
              </div>
            )}
            {item.includes("img") && (
              <div style={{ gap: "5px", padding: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    flexDirection: "row",
                    justifyContent: "center"
                  }}
                >
                  <Image sx={{ color: "#EC5858" }} />
                </div>
                <Typography
                  textAlign={"center"}
                  sx={{
                    textOverflow: "ellipsis",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                  }}
                >
                  {
                    data.elements.filter(itemLoc => itemLoc.number === item)[0]
                      .original
                  }
                </Typography>
              </div>
            )}
            {item.includes("audio") && (
              <div style={{ gap: "5px", padding: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    flexDirection: "row",
                    justifyContent: "center"
                  }}
                >
                  <MicNone sx={{ color: "#EC5858" }} />
                </div>
                <Typography
                  textAlign={"center"}
                  sx={{
                    textOverflow: "ellipsis",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                  }}
                >
                  {
                    data.elements.filter(itemLoc => itemLoc.number === item)[0]
                      .original
                  }
                </Typography>
              </div>
            )}
            {item.includes("video") && (
              <div style={{ gap: "5px", padding: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    flexDirection: "row",
                    justifyContent: "center"
                  }}
                >
                  <Videocam sx={{ color: "#EC5858" }} />
                </div>
                <Typography
                  textAlign={"center"}
                  sx={{
                    textOverflow: "ellipsis",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                  }}
                >
                  {
                    data.elements.filter(itemLoc => itemLoc.number === item)[0]
                      .original
                  }
                </Typography>
              </div>
            )}
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "#0000FF",
          width: "18px",
          height: "18px",
          top: "90%",
          right: "-11px",
          cursor: 'pointer'
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffff",
            width: "10px",
            height: "10px",
            marginLeft: "2.9px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});
