import openSocket from "socket.io-client";
import { isObject } from "lodash";
import SocketWorker from "./SocketWorker"

export function socketConnection(params) {
  let userId = "";
  let companyId = "";
  if (isObject(params)){
    companyId = params?.user?.companyId
    userId = params?.user?.id
  }
 
  return SocketWorker(companyId,userId)
}