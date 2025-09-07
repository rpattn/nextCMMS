"use client";

import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { Chip, MenuItem, TextField } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import * as React from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import { api } from '@/lib/api';
import EntityGrid from '@/components/entity/EntityGrid';
import RowActionsMenu from '@/components/entity/RowActionsMenu';

export type WorkOrderRow = {
  id: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  completedOn?: string;
};

export default function WorkOrdersGrid({
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
  rows: WorkOrderRow[];
  page: number;
  pageSize: number;
  rowCount: number;
  q?: string | null;
  loading?: boolean;
  onChangePagination?: (model: GridPaginationModel) => void;
  onChangeSort?: (model: GridSortModel) => void;
  onOpenDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAfterAction?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'custom_id', headerName: t('id_col'), width: 120 },
      { field: 'title', headerName: t('title_col'), flex: 1, minWidth: 200 },
      {
        field: 'status',
        headerName: t('status') as string,
        width: 170,
        renderCell: (params: any) => {
          const id = params.row.id as string;
          const [val, setVal] = React.useState<string>((params?.row?.status as string) || 'OPEN');
          const onChange = async (newVal: string) => {
            const prev = val;
            setVal(newVal);
            try {
              await api(`work-orders/${id}/change-status`, { method: 'PATCH', body: JSON.stringify({ status: newVal }) });
              onAfterAction?.();
            } catch (e) {
              console.error(e);
              alert('Failed to update status');
              setVal(prev);
            }
          };
          return (
            <TextField
              select
              size="small"
              value={val}
              onChange={(e) => onChange(e.target.value)}
              sx={{ minWidth: 150, verticalAlign: 'inherit' }}
            >
              {['OPEN','IN_PROGRESS','ON_HOLD','COMPLETE'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          );
        }
      },
      {
        field: 'priority',
        headerName: t('priority_col'),
        width: 140,
        renderCell: (params: any) => {
          const v = (params.value as string) || 'NONE';
          const color = v === 'HIGH' ? 'error' : v === 'MEDIUM' ? 'warning' : v === 'LOW' ? 'success' : 'default';
          return <Chip label={v} color={color as any} size="small" sx={{verticalAlign: 'inherit'}} />;
        }
      },
      {
        field: 'description',
        headerName: t('description') as string,
        flex: 1,
        minWidth: 220,
        renderCell: (params: any) => (
          <span>{params?.row?.description || ''}</span>
        )
      },
      {
        field: 'due_date',
        headerName: t('due_col'),
        width: 160,
        renderCell: (params: any) => {
          const v = params?.row?.due_date as string | undefined;
          return <span>{v ? new Date(v).toLocaleDateString() : ''}</span>;
        }
      }
      ,
      {
        field: 'updated_at',
        headerName: t('Updated') as string,
        width: 170,
        renderCell: (params: any) => {
          const v = params?.row?.updated_at as string | undefined;
          return <span>{v ? new Date(v).toLocaleString() : ''}</span>;
        }
      },
      {
        field: 'created_at',
        headerName: t('Created') as string,
        width: 170,
        renderCell: (params: any) => {
          const v = params?.row?.created_at as string | undefined;
          return <span>{v ? new Date(v).toLocaleString() : ''}</span>;
        }
      },
      {
        field: 'actions',
        headerName: '',
        sortable: false,
        filterable: false,
        width: 70,
        renderCell: (params) => {
          const id = params.row.id as string;
          return (
            <RowActionsMenu
              ariaLabel='actions'
              actions={[
                {
                  key: 'view',
                  label: 'View',
                  icon: <OpenInNewTwoToneIcon fontSize="small" />,
                  onClick: () => {
                    router.push(`/app/work-orders?wo=${id}`)
                  }
                },
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <EditTwoToneIcon fontSize="small" />,
                  onClick: () => { onEdit ? onEdit(id) : router.push(`/app/work-orders/${id}`); }
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  icon: <DeleteTwoToneIcon fontSize="small" />,
                  onClick: async () => {
                    if (!confirm('Delete this work order?')) return;
                    try {
                      await api(`work-orders/${id}`, { method: 'DELETE' });
                      const base = searchParams ? searchParams.toString() : '';
                      const params = new URLSearchParams(base);
                      router.replace(`${pathname}?${params.toString()}`);
                    } catch (e) {
                      alert('Delete failed');
                    }
                  }
                }
              ]}
            />
          );
        }
      }
    ],
    [t]
  );

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
      onRowClick={(id) => {
        const uuid = String(id);
        if (onOpenDetails) onOpenDetails(uuid);
        else router.push(`/app/work-orders/${uuid}`);
      }}
      getRowId={(row) => (row as any).id}
    />
  );
}
