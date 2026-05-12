export const blogSearchableFields = ["title", "content", "tags"];
export const blogFilterableFields = ["status", "authorId"];

export const blogDefaultInclude = {
  author: { select: { id: true, name: true, image: true } },
};
