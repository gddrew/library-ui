import apiClient from './apiClient';

import {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
} from '../query/route';

export async function fetchLatestInvoices() {
  try {
    const invoices = await listInvoices();
    return invoices.map((invoice: { amount: number }) => ({
      ...invoice,
      amount: `$${invoice.amount.toFixed(2)}`, // Format amount as a currency string
    }));
  } catch (error) {
    console.error('Error fetching the latest invoices:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchInvoiceById(invoiceId: string) {
  try {
    return await getInvoiceById(invoiceId);
  } catch (error) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function createNewInvoice(invoiceData: any) {
  try {
    return await createInvoice(invoiceData);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice.');
  }
}

export async function updateExistingInvoice(
  invoiceId: string,
  invoiceData: any
) {
  try {
    return await updateInvoice(invoiceId, invoiceData);
  } catch (error) {
    console.error(`Error updating invoice with ID ${invoiceId}:`, error);
    throw new Error('Failed to update invoice.');
  }
}

export async function fetchInvoicesPages(
  query: string,
  currentPage: number,
  itemsPerPage: number = 6
) {
  try {
    const offset = (currentPage - 1) * itemsPerPage;
    const response = await apiClient.get(`/api/invoices/invoice`, {
      params: { query, offset, limit: itemsPerPage },
    });

    return {
      invoices: response.data.invoices,
      totalPages: Math.ceil(response.data.totalCount / itemsPerPage),
    };
  } catch (error) {
    console.error('Error fetching paginated invoices:', error);
    throw new Error('Failed to fetch invoices pages.');
  }
}
