import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { listPatrons } from '@/app/services/patronService';

export default async function Page() {
  const patrons = await listPatrons();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form patrons={patrons} />
    </main>
  );
}
