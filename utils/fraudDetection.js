import Property from "../models/propertyModel.js";

export const detectFraud = async (newProperty) => {

    const { 
        title,
        description,
        listingType,
        price,
        currency,
        location,
        features,
        media,
        contact,
        status,
        condition,
        ownership,
        propertyType,
        blockNumber
    } = newProperty;
    //   const { title, price, location, landlord, blockNumber } = newProperty;

  // Normalize title (remove block/flat numbers for duplicate detection)
  const normalizedTitle = title.replace(/(flat|block)\s?[A-Za-z0-9]+/gi, "").trim().toLowerCase();

  // Find similar listings
  const similarListings = await Property.find({
        title,
        description,
        listingType,
        price,
        currency,
        location,
        features,
        media,
        contact,
        status,
        condition,
        ownership,
        propertyType,
        blockNumber
        // landlord,
        // price,
        // location
    });

  let isFraud = false;
  let reason = "";

  for (let prop of similarListings) {
    const existingTitle = prop.title.replace(/(flat|block)\s?[A-Za-z0-9]+/gi, "").trim().toLowerCase();

    if (normalizedTitle === existingTitle && prop.blockNumber !== blockNumber) {
      // Same building but different flat — ✅ valid
      continue;
    }

    if (normalizedTitle === existingTitle && prop.blockNumber === blockNumber) {
      isFraud = true;
      reason = "Duplicate property listing detected with same title and block number.";
      break;
    }
  }

  return { isFraud, reason };
};
