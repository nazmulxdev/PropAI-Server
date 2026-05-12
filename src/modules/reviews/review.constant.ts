export const reviewSearchableFields = ["comment"];
export const reviewFilterableFields = ["propertyId", "rating"];

export const reviewDefaultInclude = {
  user: { select: { id: true, name: true, image: true } },
};
