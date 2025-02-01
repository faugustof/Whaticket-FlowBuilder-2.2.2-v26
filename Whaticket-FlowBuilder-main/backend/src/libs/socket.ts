import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import logger from "../utils/logger";
import { instrument } from "@socket.io/admin-ui";
import User from "../models/User";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  if (process.env.SOCKET_ADMIN && JSON.parse(process.env.SOCKET_ADMIN)) {
    User.findByPk(1).then(
      (adminUser) => {
        instrument(io, {
          auth: {
            type: "basic",
            username: adminUser.email,
            password: adminUser.passwordHash
          },
          mode: "development",
        });
      }
    ); 
  }  
  
  const workspaces = io.of(/^\/\w+$/);
  workspaces.on("connection", socket => {

    const { userId } = socket.handshake.query;
    // logger.info(`Client connected namespace ${socket.nsp.name}`);
    // console.log(`namespace ${socket.nsp.name}`, "UserId Socket", userId)


    socket.on("joinChatBox", (ticketId: string) => {
      // logger.info(`A client joined a ticket channel namespace ${socket.nsp.name}`);
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      // logger.info(`A client joined notification channel namespace ${socket.nsp.name}`);
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      // logger.info(`A client joined to ${status} channel namespace ${socket.nsp.name}`);
      socket.join(status);
    });

    socket.on("joinTicketsLeave", (status: string) => {
      // logger.info(`A client leave to ${status} tickets channel.`);
      socket.leave(status);
    });

    socket.on("joinChatBoxLeave", (ticketId: string) => {
      // logger.info(`A client leave ticket channel ${ticketId} namespace ${socket.nsp.name}`);
      socket.leave(ticketId);
    });

    socket.on("disconnect", () => {
      // logger.info(`Client disconnected namespace ${socket.nsp.name}`);
    });

  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};