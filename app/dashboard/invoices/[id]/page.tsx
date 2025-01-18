import { getInvoiceById } from '@/app/services/invoiceService';
import { listPatrons } from '@/app/services/patronService';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import InvoiceDetails from '@/app/ui/invoices/invoice-details';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'View Invoice',
};

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const invoiceId = Number(params.id);

  // Fetch the invoice and patrons in parallel
  const [invoice, patrons] = await Promise.all([
    getInvoiceById(invoiceId),
    listPatrons(),
  ]);

  const matchingPatron = patrons.find((p) => p.patronId === invoice.patronId);
  if (matchingPatron) {
    invoice.patronName = matchingPatron.patronName;
    invoice.emailAddress = matchingPatron.emailAddress;
  }

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      {/* You can add your breadcrumb or heading here */}
      <Breadcrumbs
        breadcrumbs={[{ label: 'Invoice Detail', href: '/dashboard/invoices' }]}
      />
      <InvoiceDetails invoice={invoice} patrons={patrons} />
    </main>
  );
}
