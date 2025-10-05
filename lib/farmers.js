import Farmer from "@/models/Farmer";

export async function getFarmerByOwner(ownerId) {
  if (!ownerId) return null;
  return Farmer.findOne({ ownerId });
}

export async function ensureFarmerProfile({ ownerId, email }) {
  if (!ownerId) return null;
  let farmer = await Farmer.findOne({ ownerId });
  if (!farmer) {
    const emailName = email?.split("@")[0] || "My";
    const fallbackFarmName = `${
      emailName.replace(/[^a-zA-Z0-9 ]/g, " ").trim() || "My"
    } Farm`;

    farmer = await Farmer.create({
      ownerId,
      email,
      farmName: fallbackFarmName,
    });
  }
  return farmer;
}
