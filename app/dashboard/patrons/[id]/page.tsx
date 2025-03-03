import { getPatronById } from '@/app/services/patronService';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PatronDetails from '@/app/ui/patrons/patron-details';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export const metadata: Metadata = { title: 'View Patron' };

export default async function PatronPage({
  params: promisedParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promisedParams;
  const patronId = Number(id);
  const patron = await getPatronById(patronId);
  if (!patron) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[{ label: 'Patron Detail', href: '/dashboard/patron' }]}
      />
      <PatronDetails patron={patron} />
    </main>
  );
}
