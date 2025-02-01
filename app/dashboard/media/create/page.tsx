import Form from '@/app/ui/media/create-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { listMedia } from '@/app/services/mediaService';

export default async function Page() {
  const media = await listMedia();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Media', href: '/dashboard/media' },
          {
            label: 'Create Media',
            href: '/dashboard/media/create',
            active: true,
          },
        ]}
      />
      <Form media={media} />
    </main>
  );
}
