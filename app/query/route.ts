import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB;
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

async function listInvoices() {
  const data = await db.collection("invoices").aggregate([
    {
      $match: { amount: 25 } // Filter invoices with amount 25
    },
    {
      $lookup: {
        from: "patrons", // The customers collection
        localField: "patronId", // The field in invoices
        foreignField: "patronId", // The field in customers
        as: "patronDetails" // Output array field for joined data
      }
    },
    {
      $unwind: "$patronDetails" // Flatten the array from the $lookup
    },
    {
      $project: {
        amount: 1, // Include the amount field
        "patronDetails.patron_name": 1 // Include the name field from the joined data
      }
    }
  ]).toArray();

  return data.map(item => ({
    amount: item.amount,
    campaign: item.campaign,
    name: item.patronDetails.patron_name
  }));
}

export async function GET() {
  try {
  	return Response.json(await listInvoices());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}
