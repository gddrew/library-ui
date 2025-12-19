// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Patron = {
  patronId: number;
  patronName: string;
  status: string;
  dateOfBirth: Date;
  streetAddress: string;
  cityName: string;
  stateName: string;
  zipCode: string;
  telephoneHome: string;
  telephoneMobile: string;
  emailAddress: string;
  contactMethod: string;
  created_date: Date;
  lastUpdateDate: Date;
};

export type Media = {
  mediaId: number;
  created_date: Date;
  mediaTitle: string;
  authorName: string;
  isbnId: string | null;
  barCodeId: string;
  publicationYear: string;
  mediaType: string;
  mediaFormat: string;
  numberPages: number;
  classificationCategory: string;
  classificationSubCategory: string;
  publisherName: string;
  disposalDisposition: string;
  trackNumber: number;
  genre: string;
  musicbrainzTrackId: string;
  musicbrainzAlbumId: string;
  acquisitionDate: string;
  lastUpdateDate: Date;
  status: string;
  isSensitive: boolean;
};

export type Loan = {
  loanId: number;
  created_date: Date;
  patronId: number;
  mediaId: number;
  transactionType: string;
};

export type Invoice = {
  invoiceId: number;
  patronId: number;
  patronName: string;
  emailAddress: string;
  amount: number;
  campaign: string;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type CreateInvoicePayload = Omit<
  Invoice,
  'invoiceId' | 'patronName' | 'emailAddress' | 'date'
>;

export type CreateMediaPayload = Omit<
  Media,
  | 'mediaId'
  | 'created_date'
  | 'barCodeId'
  | 'lastUpdateDate'
  | 'status'
  | 'disposalDisposition'
> & {
  acquisitionDate: string;
  disposalDisposition?: string;
};

export type CreateLoanPayload = Omit<Loan, 'loanId' | 'created_date'>;

// The minimal fields the client must send when creating a new Patron
// Omit fields that the DB auto-generates or you don't want to supply
export type CreatePatronPayload = Omit<
  Patron,
  'patronId' | 'status' | 'created_date' | 'lastUpdateDate'
>;

export type UpdateLoanPayload = Omit<Loan, 'loanId' | 'created_date'>;

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  invoiceId: number;
  patronName: string;
  emailAddress: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  invoiceId: number;
  patronId: number;
  patronName: string;
  emailAddress: string;
  date: string;
  amount: number;
  campaign: string;
  status: 'pending' | 'paid';
};

export type PatronsTableType = {
  patronId: number;
  patronName: string;
  emailAddress: string;
  totalInvoices: number;
  totalPending: number;
  totalPaid: number;
};

export type FormattedPatronsTable = {
  patronId: number;
  patronName: string;
  emailAddress: string;
  totalInvoices: number;
  totalPending: string;
  totalPaid: string;
};

export type PatronField = {
  patronId: number;
  patronName: string;
};

export type MediaField = {
  mediaId: number;
  mediaTitle: string;
};

export type InvoiceForm = {
  invoiceId: number;
  patronId: number;
  patronName: string;
  emailAddress: string;
  date: string;
  amount: number;
  campaign: string;
  status: 'pending' | 'paid';
};

export type MediaForm = {
  mediaId: number;
  created_date: Date;
  mediaTitle: string;
  authorName: string;
  isbnId: string | null;
  barCodeId: string;
  publicationYear: string;
  mediaType: string;
  mediaFormat: string;
  numberPages: number;
  classificationCategory: string;
  classificationSubCategory: string;
  publisherName: string;
  disposalDisposition: string;
  trackNumber: number;
  genre: string;
  musicbrainzTrackId: string;
  musicbrainzAlbumId: string;
  acquisitionDate: Date;
  lastUpdateDate: Date;
  status: string;
  isSensitive: boolean;
};

// The full patron record (when reading from the DB)
export type PatronForm = {
  patronId: number;
  created_date: Date;
  patronName: string;
  dateOfBirth: Date;
  streetAddress: string;
  cityName: string;
  stateName: string;
  zipCode: string;
  telephoneHome: string;
  telephoneMobile: string;
  emailAddress: string;
  contactMethod: string;
  status: string;
  lastUpdateDate: Date;
};
