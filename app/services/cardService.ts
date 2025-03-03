import { isAxiosError } from 'axios';
import apiClient from './apiClient';

export interface Card {
  cardId: number;
  barCodeId: string;
  patronId: number;
  patronName: string;
  cardStatus: string;
  createdDate: string;
  lastUpdateDate: string;
  lastUsedDate: string | null;
}

export async function getCardsByPatronId(patronId: number): Promise<Card[]> {
  try {
    const response = await apiClient.get(
      `/api/reports/cards-patrons?patronId=${patronId}`
    );
    return response.data as Card[];
  } catch (error: unknown) {
    console.error(`Error fetching patron with ID ${patronId}:`, error);

    if (isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function createCard(patronId: number) {
  try {
    const response = await apiClient.post(`/api/cards/patron/${patronId}`);
    return response.data;
  } catch (error) {
    console.error('Error creating card:', error);
    throw error;
  }
}
