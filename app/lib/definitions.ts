// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
  };
  
  export type Patron = {
    patronId: number;
    patron_name: string;
    patron_status: string;
  };
  
  export type Invoice = {
    _id: string;
    patronId: number;
    amount: number;
    campaign: string,
    date: string;
    // In TypeScript, this is called a string union type.
    // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
    status: 'pending' | 'paid';
  };
  
  export type Revenue = {
    month: string;
    revenue: number;
  };
  
  export type LatestInvoice = {
    id: string;
    patron_name: string;
    email_address: string;
    amount: string;
  };
  
  // The database returns a number for amount, but we later format it to a string with the formatCurrency function
  export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
    amount: number;
  };
  
  export type InvoicesTable = {
    id: string;
    patronId: string;
    patron_name: string;
    email_address: string;
    date: string;
    amount: number;
    campaign: string,
    status: 'pending' | 'paid';
  };
  
  export type PatronsTableType = {
    id: string;
    patron_name: string;
    email_address: string;
    total_invoices: number;
    total_pending: number;
    total_paid: number;
  };
  
  export type FormattedPatronsTable = {
    patronId: string;
    patron_name: string;
    email_address: string;
    total_invoices: number;
    total_pending: string;
    total_paid: string;
  };
  
  export type PatronField = {
    patronId: number;
    patron_name: string;
  };
  
  export type InvoiceForm = {
    id: string;
    patronId: string;
    amount: number;
    campaign: string,
    status: 'pending' | 'paid';
  };
