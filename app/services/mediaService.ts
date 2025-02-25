import apiClient from './apiClient';
import { CreateMediaPayload, Media } from './definitions';

// Fetch all media
export async function listMedia(): Promise<Media[]> {
  try {
    const response = await apiClient.get(`/api/collection/media`);
    return response.data.map((media: Media) => ({
      mediaId: media.mediaId,
      createdDate: media.created_date,
      mediaTitle: media.mediaTitle,
      authorName: media.authorName,
      isbnId: media.isbnId,
      barCodeId: media.barCodeId,
      publicationYear: media.publicationYear,
      mediaType: media.mediaType,
      mediaFormat: media.mediaFormat,
      numberPages: media.numberPages,
      classificationCategory: media.classificationCategory,
      classificationSubCategory: media.classificationSubCategory,
      publisherName: media.publisherName,
      disposalDisposition: media.disposalDisposition,
      acquisitionDate: media.acquisitionDate,
      lastUpdateDate: media.lastUpdateDate,
      status: media.status,
      isSensitive: media.isSensitive,
    }));
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
}

// Fetch a single media item by ID
export async function getMediaByID(mediaId: number) {
  try {
    const response = await apiClient.get(`/api/collection/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching media with ID ${mediaId}:`, error);
    throw error;
  }
}

// Fetch a single media item by IsbnID
export async function getMediaByIsbnId(isbnId: string) {
  try {
    const response = await apiClient.get(
      `/api/collection/media/isbn/${isbnId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching media with ISBN ID ${isbnId}:`, error);
    throw error;
  }
}

// Fetch a media by Title
export async function getMediaByMediaTitle(mediaTitle: string) {
  try {
    const response = await apiClient.get(
      `/api/collection/media/title/${mediaTitle}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching media with title ${mediaTitle}:`, error);
    throw error;
  }
}

// Fetch a media by Author
export async function getMediaByAuthorName(authorName: string) {
  try {
    const response = await apiClient.get(
      `/api/collection/media/author/${authorName}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching media with author ${authorName}:`, error);
    throw error;
  }
}

// Fetch a media by Publisher
export async function getMediaByPublisherName(publisherName: string) {
  try {
    const response = await apiClient.get(
      `/api/collection/media/publisher/${publisherName}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching media with publisher ${publisherName}:`,
      error
    );
    throw error;
  }
}

// Create a new media item
export async function addMedia(mediaData: CreateMediaPayload): Promise<Media> {
  try {
    const response = await apiClient.post(`/api/collection/media`, mediaData);
    return response.data as Media;
  } catch (error) {
    console.error('Error creating media:', error);
    throw error;
  }
}

// Update an existing media item
export async function updateMedia(mediaId: number, mediaData: Media) {
  try {
    const response = await apiClient.put(
      `/api/collection/media/${mediaId}`,
      mediaData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating media with ID ${mediaId}:`, error);
    throw error;
  }
}

// Delete an invoice
export async function deleteMedia(mediaId: number) {
  try {
    await apiClient.delete(`/api/collection/media/${mediaId}`);
  } catch (error) {
    console.error(`Error deleting media with ID ${mediaId}:`, error);
    throw error;
  }
}

export interface LoanItem {
  loanId: number;
  patronId: number;
  patronName: string;
  checkoutDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

export interface HistoryRecord {
  mediaId: number;
  mediaTitle: string;
  items: LoanItem[];
}

export const fetchCheckoutHistory = async (
  mediaId: number
): Promise<HistoryRecord[]> => {
  const response = await apiClient.get(
    `/api/reports/loans-media?mediaId=${mediaId}`
  );
  return response.data; // Which should match CheckoutHistoryRecord[]
};
