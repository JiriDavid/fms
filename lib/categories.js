import AnimalCategory from "@/models/AnimalCategory";

const DEFAULT_CATEGORY_TEMPLATES = [
  {
    name: "Cattle",
    description: "Dairy and beef herd",
  },
  {
    name: "Goat",
    description: "Goat herd",
  },
  {
    name: "Chicken",
    description: "Layers and broilers",
  },
];

export async function ensureDefaultCategories(ownerId) {
  if (!ownerId) return;

  const existingCount = await AnimalCategory.countDocuments({ ownerId });
  if (existingCount > 0) return;

  const payload = DEFAULT_CATEGORY_TEMPLATES.map((category) => ({
    ...category,
    ownerId,
  }));

  try {
    await AnimalCategory.insertMany(payload, { ordered: false });
  } catch (error) {
    // Ignore duplicate key errors in case of races and let caller continue.
    if (error?.code !== 11000) {
      throw error;
    }
  }
}
