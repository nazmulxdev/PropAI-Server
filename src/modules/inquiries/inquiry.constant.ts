export const inquirySearchableFields = ["message"];
export const inquiryFilterableFields = ["status", "propertyId"];

export const inquiryDefaultInclude = {
  property: {
    select: { id: true, title: true, city: true, price: true, images: true },
  },
  buyer: { select: { id: true, name: true, email: true, image: true } },
  seller: { select: { id: true, name: true, email: true, image: true } },
};
