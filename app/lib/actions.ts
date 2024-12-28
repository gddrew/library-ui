"use server";

import { z } from "zod";
import { MongoClient, ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB || "test";
const db = client.db(dbName);

// Zod schema for form validation
const FormSchema = z.object({
  patronId: z.coerce.number(),
  amount: z.coerce.number(),
  campaign: z.string(),
  status: z.enum(["pending", "paid"]),
});

export async function createInvoice(formData: FormData) {
  // Extract data from FormData and validate with Zod
  const formDataObject = {
    patronId: formData.get("patronId"),
    amount: formData.get("amount"),
    campaign: formData.get("campaign"),
    status: formData.get("status"),
  };

  const parseResult = FormSchema.safeParse(formDataObject);

  if (!parseResult.success) {
    // If validation fails, throw an error or handle the validation issue
    console.error("Form validation failed:", parseResult.error.format());
    throw new Error("Invalid form data");
  }

  const { patronId, amount, campaign, status } = parseResult.data;

  // Convert amount to cents
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0]; // Get today's date

  const collection = db.collection("invoices");

  // Create the new invoice document
  const newInvoice = {
    patronId,
    amount: amountInCents,
    campaign,
    status,
    date,
  };

  // Insert the document into the 'invoices' collection
  const result = await collection.insertOne(newInvoice);

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
