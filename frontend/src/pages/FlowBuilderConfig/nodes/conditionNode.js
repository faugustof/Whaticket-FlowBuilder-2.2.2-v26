import { ImportExport, Message } from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "react-flow-renderer";

export default memo(({ data, isConnectable }) => {
  const typeCondition = (value) => {
    if(value === 1){
      return '=='
    }
    if(value === 2){
      return '>='
    }
    if(value === 3){
      return '<='
    }
    if(value === 4){
      return '<'
    }
    if(value === 5){
      return '>'
    }
  }
  return (
    <div style={{backgroundColor: '#555', padding: '8px', borderRadius: '8px'}}>
      <Handle
        type="target"
        position="left"
        style={{ background: "#0000FF" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div style={{color: '#ededed', fontSize: '16px', flexDirection: 'row', display: 'flex'}}>
        <ImportExport sx={{width: '16px', height: '16px', marginRight: '4px', marginTop: '4px'}}/>
        <div style={{color: '#ededed', fontSize: '16px'}}>
        Condição
        </div>
      </div>
      <div style={{color: '#ededed', fontSize: '12px'}}>{data.key}</div>
      <div style={{color: '#ededed', fontSize: '12px'}}>{typeCondition(data.condition)}</div>
      <div style={{color: '#ededed', fontSize: '12px'}}>{data.value}</div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{ top: 10, background: "#0000FF" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position="right"
        id="b"
        style={{ bottom: 10, top: "auto", background: "#0000FF" }}
        isConnectable={isConnectable}
      />
    </div>
  );
});
