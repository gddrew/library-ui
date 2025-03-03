import { getMediaByID } from '@/app/services/mediaService';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import MediaDetails from '@/app/ui/media/media-details';
import Breadcrumbs from '@/app/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'View Media',
};

export default async function MediaPage({
  params: promisedParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promisedParams;
  const mediaId = Number(id);
  const media = await getMediaByID(mediaId);
  if (!media) {
    notFound();
  }

  return (
    <main>
      {/* You can add your breadcrumb or heading here */}
      <Breadcrumbs
        breadcrumbs={[{ label: 'Media Detail', href: '/dashboard/media' }]}
      />
      <MediaDetails media={media} />
    </main>
  );
}
