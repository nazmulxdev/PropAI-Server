export const propertySearchableFields = [
  "title",
  "description",
  "city",
  "area",
  "address",
];
export const propertyFilterableFields = [
  "type",
  "listingType",
  "city",
  "bedrooms",
  "bathrooms",
  "furnished",
  "priceType",
  "status",
];

export const propertyDefaultInclude = {
  seller: { select: { id: true, name: true, image: true, email: true } },
  _count: { select: { savedProperties: true, inquiries: true } },
};
