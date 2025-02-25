import Breadcrumbs from '@/app/ui/breadcrumbs';
import CreatePatronForm from '@/app/ui/patrons/create-form';
import { listPatrons } from '@/app/services/patronService';

export default async function Page() {
  const patrons = await listPatrons();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Patrons', href: '/dashboard/patrons' },
          {
            label: 'Create Patron',
            href: '/dashboard/patrons/create',
            active: true,
          },
        ]}
      />
      <CreatePatronForm patron={patrons} />
    </main>
  );
}
