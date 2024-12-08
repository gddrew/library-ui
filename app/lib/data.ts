import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

import {
  PatronField,
  PatronsTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from "./definitions";

import { formatCurrency } from "./utils";

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in the environment variables.");
}

const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB || "test";
const db = client.db(dbName);

// Fetch the last 5 invoices, sorted by date
export async function fetchLatestInvoices() {
  try {
    const invoices = await db
      .collection("invoices")
      .aggregate([
        {
          $lookup: {
            from: "patrons",
            localField: "patronId",
            foreignField: "patronId",
            as: "patron",
          },
        },
        { $unwind: "$patron" },
        {
          $sort: { date: -1 },
        },
        { $limit: 5 },
        {
          $project: {
            amount: 1,
            campaign: 1,
            patron_name: "$patron.patron_name",
            email_address: "$patron.email_address",
            id: "$_id",
          },
        },
      ])
      .toArray();

    return invoices.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    const invoiceCountPromise = db.collection("invoices").countDocuments();
    const patronCountPromise = db.collection("patrons").countDocuments();
    const invoiceStatusPromise = db
      .collection("invoices")
      .aggregate([
        {
          $group: {
            _id: null,
            paid: {
              $sum: {
                $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0],
              },
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
              },
            },
          },
        },
      ])
      .toArray();

    // This is a common way to avoid waterfalls: initiate all data requests in parallel
    const [invoiceCount, patronCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      patronCountPromise,
      invoiceStatusPromise,
    ]);

    return {
      numberOfPatrons: patronCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices: formatCurrency(invoiceStatus[0]?.paid ?? 0),
      totalPendingInvoices: formatCurrency(invoiceStatus[0]?.pending ?? 0),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await db
      .collection("invoices")
      .aggregate([
        {
          $lookup: {
            from: "patrons",
            localField: "patronId",
            foreignField: "patronId",
            as: "patron",
          },
        },
        { $unwind: "$patron" },
        {
          $match: {
            $or: [
              { "patron.patron_name": { $regex: query, $options: "i" } },
              { "patron.email_address": { $regex: query, $options: "i" } },
              { amount: { $regex: query, $options: "i" } },
              { campaign: { $regex: query, $options: "i" } },
              { date: { $regex: query, $options: "i" } },
              { status: { $regex: query, $options: "i" } },
            ],
          },
        },
        {
          $sort: { date: -1 },
        },
        { $skip: offset },
        { $limit: ITEMS_PER_PAGE },
        {
          $project: {
            id: "$_id",
            amount: 1,
            campaign: 1,
            date: 1,
            status: 1,
            patron_name: "$patron.patron_name",
            email_address: "$patron.email_address",
          },
        },
      ])
      .toArray();

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await db
      .collection("invoices")
      .aggregate([
        {
          $lookup: {
            from: "patrons",
            localField: "patronId",
            foreignField: "patronId",
            as: "patron",
          },
        },
        { $unwind: "$patron" },
        {
          $match: {
            $or: [
              { "patron.patron_name": { $regex: query, $options: "i" } },
              { "patron.email_address": { $regex: query, $options: "i" } },
              { amount: { $regex: query, $options: "i" } },
              { campaign: { $regex: query, $options: "i" } },
              { date: { $regex: query, $options: "i" } },
              { status: { $regex: query, $options: "i" } },
            ],
          },
        },
        { $count: "count" },
      ])
      .toArray();

    const totalPages = Math.ceil((count[0]?.count ?? 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await db
      .collection("invoices")
      .findOne({ _id: new ObjectId(id) });

    return {
      ...invoice,
      amount: invoice?.amount / 100, // Convert amount from cents to dollars
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchPatrons() {
  try {
    const patrons = await db
      .collection<PatronField>("patrons")
      .find()
      .project({
        _id: 0, // Exclude the _id field
        patronId: 1,
        patron_name: 1,
        // Include other fields if necessary, ensuring they are serializable
      })
      .sort({ patron_name: 1 })
      .toArray();
    return patrons;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all patrons.");
  }
}

export async function fetchFilteredPatrons(query: string) {
  try {
    const patrons = await db
      .collection("patrons")
      .aggregate([
        {
          $lookup: {
            from: "invoices",
            localField: "patronId",
            foreignField: "patronId",
            as: "invoices",
          },
        },
        {
          $match: {
            $or: [
              { patron_name: { $regex: query, $options: "i" } },
              { email_address: { $regex: query, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            id: "$patronId",
            name: 1,
            email: 1,
            total_invoices: { $size: "$invoices" },
            total_pending: {
              $sum: {
                $map: {
                  input: "$invoices",
                  as: "invoice",
                  in: {
                    $cond: [
                      { $eq: ["$$invoice.status", "pending"] },
                      "$$invoice.amount",
                      0,
                    ],
                  },
                },
              },
            },
            total_paid: {
              $sum: {
                $map: {
                  input: "$invoices",
                  as: "invoice",
                  in: {
                    $cond: [
                      { $eq: ["$$invoice.status", "paid"] },
                      "$$invoice.amount",
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      ])
      .toArray();

    return patrons.map((patron) => ({
      ...patron,
      total_pending: formatCurrency(patron.total_pending),
      total_paid: formatCurrency(patron.total_paid),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch patron table.");
  }
}
