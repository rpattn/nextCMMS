"use client";

import { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EntityGrid from '@/components/entity/EntityGrid';
import RowActionsMenu from '@/components/entity/RowActionsMenu';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { api } from '@/lib/api';

export type LocationRow = {
  id: number;
  name?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
};

export default function LocationsGrid({
  rows,
  page,
  pageSize,
  rowCount,
  q,
  loading,
  onChangePagination,
  onChangeSort,
  onOpenDetails,
  onEdit,
  onAfterAction
}: {
  rows: LocationRow[];
  page: number;
  pageSize: number;
  rowCount: number;
  q?: string | null;
  loading?: boolean;
  onChangePagination?: (model: any) => void;
  onChangeSort?: (model: any) => void;
  onOpenDetails?: (id: number) => void;
  onEdit?: (id: number) => void;
  onAfterAction?: () => void;
}) {
  const router = useRouter();

  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 220 },
    { field: 'address', headerName: 'Address', flex: 1, minWidth: 220 },
    {
      field: 'updated_at', headerName: 'Updated', width: 170,
      renderCell: (params: any) => {
        const v = params?.row?.updated_at as string | undefined;
        return <span>{v ? new Date(v).toLocaleString() : ''}</span>;
      }
    },
    {
      field: 'created_at', headerName: 'Created', width: 170,
      renderCell: (params: any) => {
        const v = params?.row?.created_at as string | undefined;
        return <span>{v ? new Date(v).toLocaleString() : ''}</span>;
      }
    },
    {
      field: 'actions', headerName: '', sortable: false, filterable: false, width: 70,
      renderCell: (params: any) => {
        const id = params.row.id as number;
        return (
          <RowActionsMenu
            actions={[
              { key: 'view', label: 'View', icon: <OpenInNewTwoToneIcon fontSize="small" />, onClick: () => router.push(`/app/locations/${id}`) },
              { key: 'edit', label: 'Edit', icon: <EditTwoToneIcon fontSize="small" />, onClick: () => onEdit ? onEdit(id) : router.push(`/app/locations/${id}`) },
              { key: 'delete', label: 'Delete', icon: <DeleteTwoToneIcon fontSize="small" />, onClick: async () => {
                if (!confirm('Delete this location?')) return;
                try { await api(`locations/${id}`, { method: 'DELETE' }); onAfterAction?.(); }
                catch { alert('Delete failed'); }
              } }
            ]}
          />
        );
      }
    }
  ], [onEdit, onAfterAction, router]);

  return (
    <EntityGrid
      rows={rows}
      columns={columns}
      page={page}
      pageSize={pageSize}
      rowCount={rowCount}
      q={q}
      loading={loading}
      onChangePagination={onChangePagination}
      onChangeSort={onChangeSort}
      onRowClick={(id) => onOpenDetails?.(Number(id))}
    />
  );
}

