import apiClient from './apiClient';
import { Loan, CreateLoanPayload, UpdateLoanPayload } from './definitions';

export async function createLoan(payload: CreateLoanPayload): Promise<Loan> {
  if (!payload.patronId || typeof payload.patronId !== 'number') {
    throw new Error('Invalid or missing Patron ID');
  }
  if (!Array.isArray(payload.mediaId) || payload.mediaId.length === 0) {
    throw new Error('Invalid or missing Media Id(s)');
  }

  const requestPayload = { ...payload, transactionType: 'CHECKOUT' };

  try {
    const response = await apiClient.post('/api/loans/action', requestPayload);
    return response.data;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
}

export async function getLoanById(loanId: number): Promise<Loan> {
  try {
    const response = await apiClient.get(`api/loans/history/loan/${loanId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching loan with ID ${loanId}:`, error);
    throw error;
  }
}

export async function updateLoan(payload: UpdateLoanPayload): Promise<Loan> {
  if (!payload.patronId || typeof payload.patronId !== 'number') {
    throw new Error('Invalid or missing Patron ID');
  }
  if (!Array.isArray(payload.mediaId) || payload.mediaId.length === 0) {
    throw new Error('Invalid or missing Media Id(s)');
  }

  const requestPayload = { ...payload, transactionType: 'RETURN' };

  try {
    const response = await apiClient.post(`api/loans/action`, requestPayload);
    return response.data;
  } catch (error) {
    console.error('Error updating loan:', error);
    throw error;
  }
}
