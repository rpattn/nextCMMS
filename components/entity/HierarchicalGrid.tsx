"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Box, IconButton, Chip } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

export type HierNode = { id: number | string; hasChildren?: boolean; [key: string]: any };

type NodeWithMeta = HierNode & { hierarchy: Array<number | string>; childrenFetched?: boolean };

export default function HierarchicalGrid({
  columns,
  primaryField,
  fetchChildren,
  onRowClick,
  storageKey,
  childCountAccessor,
  paginationModel,
  onPaginationModelChange
}: {
  columns: GridColDef[];
  primaryField: string;
  fetchChildren: (parentId: number | string) => Promise<HierNode[]>;
  onRowClick?: (id: number | string, params: any) => void;
  storageKey?: string;
  childCountAccessor?: (row: HierNode) => number | null | undefined;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
}) {
  const [nodes, setNodes] = useState<NodeWithMeta[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number | string>>(new Set());
  const fetchedOnceRef = useRef<Set<number | string>>(new Set());
  const loadingChildrenRef = useRef<Set<number | string>>(new Set());
  const [loading, setLoading] = useState(false);

  const ensureChildrenLoaded = useCallback(async (row: NodeWithMeta) => {
    if (!row.hasChildren) return;
    if (row.childrenFetched) return;
    if (fetchedOnceRef.current.has(row.id)) return;
    if (loadingChildrenRef.current.has(row.id)) return;
    loadingChildrenRef.current.add(row.id);
    // Mark fetched early to avoid parallel fetch from rehydrate
    fetchedOnceRef.current.add(row.id);
    setLoading(true);
    try {
      const children = await fetchChildren(row.id);
      setNodes((prev) => {
        const next = prev.slice();
        const idx = next.findIndex((n) => n.id === row.id);
        if (idx !== -1) next[idx] = { ...next[idx], childrenFetched: true };
        const parentHierarchy = row.hierarchy || [row.id];
        const mapped = children.map((c) => ({ ...c, hierarchy: [...parentHierarchy, c.id], childrenFetched: false }));
        const existingIds = new Set(next.map((n) => n.id));
        for (const m of mapped) {
          if (!existingIds.has(m.id)) {
            next.push(m);
          }
        }
        return next;
      });
    } finally {
      loadingChildrenRef.current.delete(row.id);
      setLoading(false);
    }
  }, [fetchChildren]);

  // initial roots load
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const roots = await fetchChildren(0);
        if (!active) return;
        setNodes(roots.map((r) => ({ ...r, hierarchy: [r.id], childrenFetched: false })));
        // load saved expanded ids
        if (storageKey) {
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              const arr: Array<number | string> = JSON.parse(raw);
              setExpandedIds(new Set(arr));
            }
          } catch {}
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [fetchChildren, storageKey]);

  // persist expanded ids
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(expandedIds)));
    } catch {}
  }, [expandedIds, storageKey]);

  // rehydrate: ensure expanded nodes have their children loaded
  useEffect(() => {
    const loadMissing = async () => {
      for (const row of nodes) {
        if (expandedIds.has(row.id) && row.hasChildren) {
          if (!fetchedOnceRef.current.has(row.id) || !row.childrenFetched) {
            await ensureChildrenLoaded(row);
          }
        }
      }
    };
    loadMissing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, expandedIds]);

  const toggleExpand = useCallback(async (row: NodeWithMeta) => {
    const next = new Set(expandedIds);
    if (next.has(row.id)) {
      next.delete(row.id);
      setExpandedIds(next);
    } else {
      setExpandedIds(next.add(row.id));
      if (row.hasChildren && (!fetchedOnceRef.current.has(row.id) || !row.childrenFetched)) {
        await ensureChildrenLoaded(row);
      }
    }
  }, [expandedIds, ensureChildrenLoaded]);

  const visibleRows: NodeWithMeta[] = useMemo(() => {
    // Build ordering and parent->children mapping based on hierarchy arrays
    const order = new Map<any, number>();
    nodes.forEach((n, idx) => order.set(n.id, idx));
    const children = new Map<any, NodeWithMeta[]>();
    const roots: NodeWithMeta[] = [];
    for (const n of nodes) {
      const h = n.hierarchy || [];
      const parentId = h.length > 1 ? h[h.length - 2] : undefined;
      if (parentId === undefined) roots.push(n);
      else {
        const arr = children.get(parentId) || [];
        arr.push(n);
        children.set(parentId, arr);
      }
    }
    roots.sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
    for (const [pid, arr] of children) arr.sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
    const out: NodeWithMeta[] = [];
    const visit = (n: NodeWithMeta) => {
      out.push(n);
      if (expandedIds.has(n.id)) {
        const arr = children.get(n.id) || [];
        for (const ch of arr) visit(ch);
      }
    };
    for (const r of roots) visit(r);
    return out;
  }, [nodes, expandedIds]);

  const cols: GridColDef[] = useMemo(() => {
    return columns.map((c) => {
      if (c.field !== primaryField) return c;
      return {
        ...c,
        renderCell: (params: any) => {
          const row = params.row as NodeWithMeta;
          const depth = (row.hierarchy?.length || 1) - 1;
          const canExpand = !!row.hasChildren;
          const isExpanded = expandedIds.has(row.id);
          const count = childCountAccessor ? (childCountAccessor(row) || 0) : undefined;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {canExpand ? (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(row); }} sx={{ mr: 1 }}>
                  {isExpanded ? <ExpandLess fontSize="inherit" /> : <ExpandMore fontSize="inherit" />}
                </IconButton>
              ) : <span style={{ width: 32, display: 'inline-block' }} />}
              <Box sx={{ ml: depth }}>
                {c.renderCell ? c.renderCell(params) : (params.value as any)}
                {typeof count === 'number' && count > 0 && (
                  <Chip size="small" label={count} sx={{ ml: 1 }} />
                )}
              </Box>
            </Box>
          );
        }
      } as GridColDef;
    });
  }, [columns, primaryField, expandedIds, toggleExpand, childCountAccessor]);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        sx={{
          bgcolor: 'background.paper', color: 'text.primary', borderColor: 'divider',
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' }
        }}
        rows={visibleRows}
        loading={loading}
        columns={cols as any}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        disableColumnMenu
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        onRowClick={(p) => onRowClick?.(p.id, p)}
        pageSizeOptions={[5, 10, 20, 50, 100]}
      />
    </div>
  );
}
