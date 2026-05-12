import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";

// Get all conversations for the current user (both buyer/seller)
const getConversations = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      property: { select: { id: true, title: true, images: true } },
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  // Add unread count for current user
  const result = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          read: false,
          senderId: { not: userId }, // messages from other party unread by me
        },
      });
      return {
        ...conv,
        unreadCount,
      };
    }),
  );

  return result;
};

// Get messages in a conversation (paginated)
const getMessages = async (
  conversationId: string,
  userId: string,
  before?: string,
  limit: number = 50,
) => {
  // Verify user is participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { buyerId: true, sellerId: true },
  });
  if (!conversation)
    throw new AppError(404, "Conversation not found", "NOT_FOUND");
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new AppError(
      403,
      "You are not a participant in this conversation",
      "UNAUTHORIZED",
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  return messages.reverse(); // return in chronological order
};

// Mark all messages in a conversation as read for the current user
const markConversationAsRead = async (
  conversationId: string,
  userId: string,
) => {
  // Verify participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { buyerId: true, sellerId: true },
  });
  if (!conversation)
    throw new AppError(404, "Conversation not found", "NOT_FOUND");
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new AppError(403, "Unauthorized", "UNAUTHORIZED");
  }

  await prisma.message.updateMany({
    where: {
      conversationId,
      read: false,
      senderId: { not: userId }, // messages sent by the other party
    },
    data: { read: true },
  });

  return { message: "Messages marked as read" };
};

export const messageService = {
  getConversations,
  getMessages,
  markConversationAsRead,
};
