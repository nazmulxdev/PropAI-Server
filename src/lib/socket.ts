/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "./prisma.js";
import { auth } from "./auth.js";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5000", "http://localhost:3000"],
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(socket.handshake.headers as any),
      });

      if (!session) {
        return next(new Error("Authentication failed"));
      }

      (socket as any).user = session.user;
      next();
    } catch (error) {
      console.log(error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.name} (${socket.id})`);

    // Join user's private room for notifications
    socket.join(`user_${user.id}`);

    // Join a conversation room
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${user.id} joined conversation: ${conversationId}`);
    });

    //  Leave a conversation
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Handle sending messages
    socket.on(
      "send_message",
      async (data: { conversationId: string; content: string }) => {
        const { conversationId, content } = data;

        try {
          // Save to DB
          const message = await prisma.message.create({
            data: {
              conversationId,
              senderId: user.id,
              content,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          });

          // Update conversation lastMessageAt
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
          });

          // Emit to the room
          io.to(`conversation_${conversationId}`).emit("new_message", message);
        } catch (error) {
          console.error("Error saving/sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      },
    );

    socket.on("typing_start", (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId: user.id,
        name: user.name,
      });
    });

    socket.on("typing_stop", (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        userId: user.id,
      });
    });

    socket.on("mark_read", async (conversationId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            read: false,
            senderId: { not: user.id },
          },
          data: { read: true },
        });
      } catch (error) {
        console.error("Error marking read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
