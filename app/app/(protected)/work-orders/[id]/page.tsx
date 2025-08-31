import { apiServer } from '@/lib/apiServer';
import { Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';

type WorkOrder = {
  id: number;
  title?: string;
  description?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | string;
  dueDate?: string;
  status?: string;
};

async function getWorkOrder(id: number) {
  try {
    return await apiServer<WorkOrder>(`work-orders/${id}`);
  } catch {
    return null;
  }
}

function PriorityChip({ value }: { value?: string }) {
  const color =
    value === 'HIGH' ? 'error' : value === 'MEDIUM' ? 'warning' : value === 'LOW' ? 'success' : 'default';
  return <Chip label={value || 'NONE'} color={color as any} size="small" />;
}

export default async function WorkOrderDetails(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const wo = await getWorkOrder(id);
  if (!wo) return <Typography sx={{ p: 3 }}>Work order not found.</Typography>;
  const due = wo.dueDate ? new Date(wo.dueDate) : null;
  const overdue = due ? due.getTime() < Date.now() : false;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          #{wo.id} {wo.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <PriorityChip value={wo.priority} />
          {wo.status && <Chip label={wo.status} size="small" />}
          {due && (
            <Chip
              label={`Due ${due.toLocaleDateString()}`}
              size="small"
              color={overdue ? 'error' : 'default'}
              variant={overdue ? 'filled' : 'outlined'}
            />
          )}
        </Stack>
        {wo.description && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {wo.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

