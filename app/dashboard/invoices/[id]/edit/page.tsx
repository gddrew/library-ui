import Form from '@/app/ui/invoices/invoice-details';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { getInvoiceById } from '@/app/services/invoiceService';
import { listPatrons } from '@/app/services/patronService';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Invoice',
};

export default async function Page(props: { params: Promise<{ id: number }> }) {
  const params = await props.params;
  const invoiceId = params.id;
  const [invoice, patrons] = await Promise.all([
    getInvoiceById(invoiceId),
    listPatrons(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${invoiceId}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} patrons={patrons} />
    </main>
  );
}
