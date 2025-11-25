import Expense from "@/models/Expense";
import Sale from "@/models/Sale";
import Animal from "@/models/Animal";

export async function getProfitAndLoss(ownerId, { startDate, endDate }) {
  const salesMatch = { ownerId };
  const expensesMatch = { ownerId };

  if (startDate || endDate) {
    salesMatch.saleDate = {};
    expensesMatch.date = {};
    if (startDate) {
      salesMatch.saleDate.$gte = new Date(startDate);
      expensesMatch.date.$gte = new Date(startDate);
    }
    if (endDate) {
      salesMatch.saleDate.$lte = new Date(endDate);
      expensesMatch.date.$lte = new Date(endDate);
    }
  }

  const [sales, expenses] = await Promise.all([
    Sale.aggregate([
      { $match: salesMatch },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Expense.aggregate([
      { $match: expensesMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalSales = sales[0]?.total || 0;
  const totalExpenses = expenses[0]?.total || 0;

  return {
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses,
  };
}

export async function getAnimalGrowth(ownerId, livestockType) {
  const match = { ownerId };
  if (livestockType) {
    match.livestockType = livestockType;
  }

  const animals = await Animal.find(match).select("batchName weightHistory");

  return animals.map((animal) => ({
    batchName: animal.batchName,
    weightHistory: animal.weightHistory.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
  }));
}

export async function getFeedConsumption(
  ownerId,
  UsageLogModel,
  { startDate, endDate }
) {
  const match = { ownerId, feedId: { $ne: null } };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const data = await UsageLogModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$feedId",
        totalQuantity: { $sum: "$quantity" },
        lastUsed: { $max: "$date" },
      },
    },
  ]);

  return data;
}
