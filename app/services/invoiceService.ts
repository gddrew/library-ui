import apiClient from './apiClient';
import { CreateInvoicePayload, Invoice } from './definitions';

// Fetch all invoices
export async function listInvoices(): Promise<Invoice[]> {
  try {
    const response = await apiClient.get(`/api/reports/invoices-patrons`);
    return response.data.map((invoice: Invoice) => ({
      invoiceId: invoice.invoiceId,
      amount: invoice.amount,
      campaign: invoice.campaign,
      patronId: invoice.patronId,
      status: invoice.status,
      date: invoice.date,
      patronName: invoice.patronName,
      emailAddress: invoice.emailAddress,
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

// Fetch a single invoice by ID
export async function getInvoiceById(invoiceId: number) {
  try {
    const response = await apiClient.get(`/api/invoices/invoice/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, error);
    throw error;
  }
}

// Create a new invoice
export async function createInvoice(
  invoiceData: CreateInvoicePayload
): Promise<Invoice> {
  try {
    const response = await apiClient.post(
      `/api/invoices/invoice/create`,
      invoiceData
    );
    return response.data as Invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Update an existing invoice
export async function updateInvoice(invoiceId: number, invoiceData: Invoice) {
  try {
    const response = await apiClient.put(
      `/api/invoices/invoice/${invoiceId}`,
      invoiceData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating invoice with ID ${invoiceId}:`, error);
    throw error;
  }
}

// Delete an invoice
export async function deleteInvoice(invoiceId: number) {
  try {
    await apiClient.delete(`/api/invoices/invoice/${invoiceId}`);
  } catch (error) {
    console.error(`Error deleting invoice with ID ${invoiceId}:`, error);
    throw error;
  }
}
