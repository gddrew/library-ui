import apiClient from '../lib/apiClient';

// Fetch all invoices
export async function listInvoices() {
  try {
    const response = await apiClient.get(`/api/invoices/invoice`);
    return response.data.map((invoice: any) => ({
      amount: invoice.amount,
      campaign: invoice.campaign,
      patronId: invoice.patronId,
      status: invoice.status,
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

// Fetch a single invoice by ID
export async function getInvoiceById(invoiceId: string) {
  try {
    const response = await apiClient.get(`/api/invoices/invoice/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, error);
    throw error;
  }
}

// Create a new invoice
export async function createInvoice(invoiceData: any) {
  try {
    const response = await apiClient.post(
      `/api/invoices/invoice/create`,
      invoiceData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Update an existing invoice
export async function updateInvoice(invoiceId: string, invoiceData: any) {
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

// Delete an invoice (if applicable in your API)
export async function deleteInvoice(invoiceId: string) {
  try {
    await apiClient.delete(`/api/invoices/invoice/${invoiceId}`);
  } catch (error) {
    console.error(`Error deleting invoice with ID ${invoiceId}:`, error);
    throw error;
  }
}
