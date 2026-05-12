export const messageSearchableFields: string[] = []; // No search on messages content for now
export const messageFilterableFields = ["conversationId"];

export const messageDefaultInclude = {
  sender: { select: { id: true, name: true, image: true } },
};

export const conversationInclude = {
  property: { select: { id: true, title: true, images: true } },
  buyer: { select: { id: true, name: true, image: true } },
  seller: { select: { id: true, name: true, image: true } },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: { sender: { select: { id: true, name: true } } },
  },
};
