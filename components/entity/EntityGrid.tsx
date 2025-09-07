"use client";

import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel, MuiEvent } from '@mui/x-data-grid';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type EntityRow = { id: string | number } & Record<string, any>;

export default function EntityGrid<T extends EntityRow>({
  rows,
  columns,
  page,
  pageSize,
  rowCount,
  q,
  loading,
  onChangePagination,
  onChangeSort,
  onRowClick,
  getRowId
}: {
  rows: T[];
  columns: GridColDef<T>[];
  page: number;
  pageSize: number;
  rowCount: number;
  q?: string | null;
  loading?: boolean;
  onChangePagination?: (model: GridPaginationModel) => void;
  onChangeSort?: (model: GridSortModel) => void;
  onRowClick?: (id: T["id"], params: any) => void;
  getRowId?: (row: T) => string | number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const paginationModel = useMemo(() => ({ page, pageSize }), [page, pageSize]);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    if (!mountedRef.current) return;
    if (onChangePagination) {
      onChangePagination(model);
      return;
    }
    const base = searchParams ? searchParams.toString() : '';
    const params = new URLSearchParams(base);
    params.set('page', String(model.page));
    params.set('size', String(model.pageSize));
    if (q) params.set('q', String(q));
    router.push(`${pathname}?${params.toString()}`);
  }, [onChangePagination, pathname, q, router, searchParams]);

  const handleSortChange = useCallback((model: GridSortModel) => {
    if (!mountedRef.current) return;
    if (onChangeSort) {
      onChangeSort(model);
      return;
    }
    const base = searchParams ? searchParams.toString() : '';
    const params = new URLSearchParams(base);
    if (model.length) params.set('sort', `${model[0].field},${model[0].sort || 'asc'}`);
    else params.delete('sort');
    router.push(`${pathname}?${params.toString()}`);
  }, [onChangeSort, pathname, router, searchParams]);

  const handleRowClick = useCallback((e: any, params: any) => {
    const id = params?.id as T["id"];
    console.log(e, params)
    let preventClick = (e.target?.ariaLabel === "actions") || (e.target?.parentElement?.ariaLabel === "actions")
    if (preventClick) return;
    onRowClick?.(id, params);
  }, [onRowClick]);

  if (!isMounted) {
    return (
      <div style={{ height: 600, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div aria-busy="true" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 18,
              height: 18,
              border: '2px solid var(--mui-palette-divider)',
              borderTopColor: 'var(--mui-palette-text-secondary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'entity-spin 0.8s linear infinite'
            }}
          />
          <span style={{ color: 'var(--mui-palette-text-secondary)' }}>Loading…</span>
        </div>
        <style>{`@keyframes entity-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderColor: 'divider',
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' }
        }}
        loading={!!loading}
        rows={rows}
        columns={columns as any}
        pagination
        paginationMode="server"
        sortingMode="server"
        rowCount={rowCount}
        onPaginationModelChange={handlePaginationChange}
        onSortModelChange={handleSortChange}
        paginationModel={paginationModel}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        disableColumnMenu
        disableRowSelectionOnClick
        onRowClick={(params, event) => handleRowClick(event, params)}
        getRowId={getRowId || ((row: any) => row.id)}
      />
    </div>
  );
}
