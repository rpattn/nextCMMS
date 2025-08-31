import LocationsClientPage from '@/components/locations/LocationsClientPage';
import { Suspense } from 'react';

export default async function LocationsPage(props: { searchParams: Promise<{ page?: string; size?: string; q?: string; sort?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page ?? '0');
  const size = Number(searchParams?.size ?? '10');
  const q = searchParams?.q?.toString()?.trim() || '';
  const sort = searchParams?.sort?.toString() || null;
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>Loading locations…</div>}>
      <LocationsClientPage initialPage={isNaN(page) ? 0 : page} initialSize={isNaN(size) ? 10 : size} initialQ={q} initialSort={sort} />
    </Suspense>
  );
}

