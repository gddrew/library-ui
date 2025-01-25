import apiClient from './apiClient';
import {
  CreateInvoicePayload,
  Invoice,
  InvoiceResponse,
  PaginatedResponse,
} from './definitions';

// Fetch paginated and filtered invoices
export async function listInvoices(
  query: string,
  page: number,
  size: number = 7
): Promise<PaginatedResponse<InvoiceResponse>> {
  try {
    const response = await apiClient.get(`/api/invoices`, {
      params: {
        query: query || undefined, // Send 'query' only if it's not empty
        page,
        size,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

// Fetch a single invoice by ID
export async function getInvoiceById(
  invoiceId: number
): Promise<InvoiceResponse> {
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
): Promise<InvoiceResponse> {
  try {
    const response = await apiClient.post(
      `/api/invoices/invoice/create`,
      invoiceData
    );
    return response.data as InvoiceResponse;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Update an existing invoice
export async function updateInvoice(
  invoiceId: number,
  invoiceData: Partial<Invoice>
): Promise<InvoiceResponse> {
  try {
    const response = await apiClient.put(
      `/api/invoices/invoice/${invoiceId}`,
      invoiceData
    );
    return response.data as InvoiceResponse;
  } catch (error) {
    console.error(`Error updating invoice with ID ${invoiceId}:`, error);
    throw error;
  }
}

// Delete an invoice
export async function deleteInvoice(invoiceId: number): Promise<void> {
  try {
    await apiClient.delete(`/api/invoices/invoice/${invoiceId}`);
  } catch (error) {
    console.error(`Error deleting invoice with ID ${invoiceId}:`, error);
    throw error;
  }
}
