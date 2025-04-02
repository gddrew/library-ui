import Breadcrumbs from '@/app/ui/breadcrumbs';
import CreatePatronForm from '@/app/ui/patrons/create-form';

export default async function Page() {
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
      <CreatePatronForm />
    </main>
  );
}
