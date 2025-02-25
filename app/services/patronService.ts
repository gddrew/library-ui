import apiClient from './apiClient';
import { CreatePatronPayload, Patron } from './definitions';

// Fetch all patrons
export async function listPatrons(): Promise<Patron[]> {
  try {
    const response = await apiClient.get(`/api/patrons`);
    return response.data.map((patron: Patron) => ({
      patronId: patron.patronId,
      patronName: patron.patronName,
      dateOfBirth: patron.dateOfBirth,
      streetAddress: patron.streetAddress,
      cityName: patron.cityName,
      stateName: patron.stateName,
      zipCode: patron.zipCode,
      telephoneHome: patron.telephoneHome,
      telephoneMobile: patron.telephoneMobile,
      contactMethod: patron.contactMethod,
      emailAddress: patron.emailAddress,
      status: patron.status,
      created_date: patron.created_date,
      lastUpdateDate: patron.lastUpdateDate,
    }));
  } catch (error) {
    console.error('Error fetching patrons:', error);
    throw error;
  }
}

// Fetch a patron by ID
export async function getPatronById(patronId: number) {
  try {
    const response = await apiClient.get(`/api/patrons/${patronId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patron with ID ${patronId}:`, error);
    throw error;
  }
}

// Fetch a patron by Name
export async function getPatronByName(patronName: string) {
  try {
    const response = await apiClient.get(
      `/api/patrons/patron/name/${patronName}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching patron with Name ${patronName}:`, error);
    throw error;
  }
}

// Fetch a patron by BirthDate
export async function getPatronByDateOfBirth(patronDateOfBirth: Date) {
  try {
    const response = await apiClient.get(
      `/api/patrons/patron/dob/${patronDateOfBirth}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching patron with birth date ${patronDateOfBirth}:`,
      error
    );
    throw error;
  }
}

// Fetch a patron by Telephone
export async function getPatronByTelephone(patronTelephone: string) {
  try {
    const response = await apiClient.get(
      `/api/patrons/patron/telephone/${patronTelephone}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching patron with telephone ${patronTelephone}:`,
      error
    );
    throw error;
  }
}

// Fetch a patron by Email
export async function getPatronByEmail(patronEmail: string) {
  try {
    const response = await apiClient.get(
      `/api/patrons/patron/email/${patronEmail}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching patron with email ${patronEmail}:`, error);
    throw error;
  }
}

// Create a new patron
export async function createPatron(
  patronData: CreatePatronPayload
): Promise<Patron> {
  try {
    const response = await apiClient.post(`/api/patrons`, patronData);
    return response.data;
  } catch (error) {
    console.error('Error creating patron:', error);
    throw error;
  }
}

// Update an existing Patron
export async function updatePatron(patronId: number, patronData: Patron) {
  try {
    const response = await apiClient.put(
      `/api/patrons/${patronId}`,
      patronData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating patron with ID ${patronId}:`, error);
    throw error;
  }
}

// Delete a patron
export async function deletePatron(patronId: number) {
  try {
    await apiClient.delete(`/api/patrons/patron/${patronId}`);
  } catch (error) {
    console.error(`Error deleting patron with ID ${patronId}:`, error);
    throw error;
  }
}
