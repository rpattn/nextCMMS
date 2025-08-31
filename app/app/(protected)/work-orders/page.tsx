import WorkOrdersClientPage from '@/components/work-orders/WorkOrdersClientPage';
import { Suspense } from 'react';

export default async function WorkOrdersPage(props: {
  searchParams: Promise<{ page?: string; size?: string; q?: string; sort?: string; priority?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page ?? '0');
  const size = Number(searchParams?.size ?? '10');
  const q = searchParams?.q?.toString()?.trim() || '';
  const sort = searchParams?.sort?.toString() || null;
  const priority = searchParams?.priority?.toString()?.toUpperCase() || null;
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div aria-busy="true" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 18,
                height: 18,
                border: '2px solid var(--mui-palette-divider)',
                borderTopColor: 'var(--mui-palette-text-secondary)',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'wo-spin 0.8s linear infinite'
              }}
            />
            <span style={{ color: 'var(--mui-palette-text-secondary)' }}>Loading work orders…</span>
          </div>
          <style>{`@keyframes wo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <WorkOrdersClientPage
        initialPage={isNaN(page) ? 0 : page}
        initialSize={isNaN(size) ? 10 : size}
        initialQ={q}
        initialSort={sort}
        initialPriority={priority}
      />
    </Suspense>
  );
}
