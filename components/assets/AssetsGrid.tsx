"use client";

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EntityGrid from '@/components/entity/EntityGrid';
import RowActionsMenu from '@/components/entity/RowActionsMenu';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { api } from '@/lib/api';

export type AssetRow = {
  id: number;
  name?: string;
  description?: string;
  status?: string;
  location?: { name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function AssetsGrid({
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
  rows: AssetRow[];
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
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    {
      field: 'status', headerName: 'Status', width: 140,
      renderCell: (params: any) => {
        const v = (params.value as string) || 'UNKNOWN';
        const color = v === 'OPERATIONAL' ? 'success' : v === 'DOWN' ? 'error' : v === 'DISPOSED' ? 'warning' : 'default';
        return <Chip size="small" label={v} color={color as any} sx={{ verticalAlign: 'inherit' }} />;
      }
    },
    {
      field: 'location', headerName: 'Location', width: 220,
      renderCell: (params: any) => <span>{params?.row?.location?.name || ''}</span>
    },
    {
      field: 'updatedAt', headerName: 'Updated', width: 170,
      renderCell: (params: any) => {
        const v = params?.row?.updated_at as string | undefined;
        return <span>{v ? new Date(v).toLocaleString() : ''}</span>;
      }
    },
    {
      field: 'createdAt', headerName: 'Created', width: 170,
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
              { key: 'view', label: 'View', icon: <OpenInNewTwoToneIcon fontSize="small" />, onClick: () => router.push(`/app/assets/${id}`) },
              { key: 'edit', label: 'Edit', icon: <EditTwoToneIcon fontSize="small" />, onClick: () => onEdit ? onEdit(id) : router.push(`/app/assets/${id}`) },
              { key: 'delete', label: 'Delete', icon: <DeleteTwoToneIcon fontSize="small" />, onClick: async () => {
                if (!confirm('Delete this asset?')) return;
                try { await api(`assets/${id}`, { method: 'DELETE' }); onAfterAction?.(); }
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
