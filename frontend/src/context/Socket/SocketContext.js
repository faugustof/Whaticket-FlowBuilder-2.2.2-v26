import { createContext } from "react";
import openSocket from "socket.io-client";
// import config from "../../services/config";

const socketManager = {
	currentSocket: null,

	GetSocket: function () {
		const publicToken = localStorage.getItem("public-token");

		if (publicToken !== this.currentToken) {
			if (this.currentSocket) {
				this.currentSocket.disconnect();
			}

			this.currentToken = publicToken;
			this.currentSocket = openSocket(process.env.REACT_APP_BACKEND_URL, {
				transports: ["websocket"],
				pingTimeout: 18000,
				pingInterval: 18000,
				query: publicToken ? { token: publicToken } : {},
				// auth: publicToken ? { token: publicToken } : {},
			});
		}
		return this.currentSocket;
	},

	onConnect: function (callbackConnect) {
		if (this.currentSocket && this.currentSocket.connected) {
			callbackConnect();
		}
		this.currentSocket.on("connect", callbackConnect);
	},
};

const SocketContext = createContext()

export { SocketContext, socketManager };
