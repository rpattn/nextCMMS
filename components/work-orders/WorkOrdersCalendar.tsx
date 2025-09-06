"use client";

import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Button, ButtonGroup, Stack, Typography, CircularProgress } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import enGb from '@fullcalendar/core/locales/en-gb';
import frLocale from '@fullcalendar/core/locales/fr';
import esLocale from '@fullcalendar/core/locales/es';

type ServerEvent<T = any> = {
  type: string;
  date: string; // ISO
  event: T;
};

type WorkOrderBase = {
  id: number;
  title?: string;
  startDate?: string;
  endDate?: string;
};

export default function WorkOrdersCalendar({ onDateClick }: { onDateClick?: (date: Date) => void }) {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const calendarRef = useRef<any>(null);
  const [title, setTitle] = useState('');
  const locale = lang === 'fr' ? frLocale : lang === 'es' ? esLocale : enGb;

  // Track the last fetched range so we don't refetch/clear unnecessarily
  const lastRangeRef = useRef<{ start: number; end: number } | null>(null);
  const lastTitleRef = useRef<string>('');
  const lastEventsRef = useRef<any[]>([]); // cache the last EventInput[]


  const toFcEvents = (res: ServerEvent<WorkOrderBase>[]) =>
    (res || []).map((e) => {
      const wo = e.event;
      const id = wo.id;
      const title = wo.title ? `#${id} ${wo.title}` : `#${id}`;
      const startStr = (wo as any).due_date || wo.startDate || e.date;
      const endStr = wo.endDate || undefined;
      const pri = (wo as any)?.priority;
      const color =
        pri === 'HIGH' ? '#FF1943' :
        pri === 'MEDIUM' ? '#FFA319' :
        pri === 'LOW' ? '#57CA22' :
        undefined;

      return {
        id: String(id),
        title,
        // Make sure these are Dates or ISO strings FullCalendar can parse:
        start: startStr ? new Date(startStr) : undefined,
        end: endStr ? new Date(endStr) : undefined,
        allDay: true,
        color,
        extendedProps: { type: e.type }
      };
    });

  return (
    <Box sx={{ p: { xs: 0, md: 1 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 1, gap: 1 }}
      >
        <ButtonGroup size="small">
          <Button onClick={() => { const api = calendarRef.current?.getApi?.(); if (!api) return; api.prev(); setTitle(api.view.title); }}>
            {t('previous') || 'Previous'}
          </Button>
          <Button onClick={() => { const api = calendarRef.current?.getApi?.(); if (!api) return; api.today(); setTitle(api.view.title); }}>
            {t('today') || 'Today'}
          </Button>
          <Button onClick={() => { const api = calendarRef.current?.getApi?.(); if (!api) return; api.next(); setTitle(api.view.title); }}>
            {t('next') || 'Next'}
          </Button>
        </ButtonGroup>

        <Typography variant="h6" component="div" sx={{ textAlign: { xs: 'left', sm: 'center' }, flex: 1 }}>
          {title}
        </Typography>

        <ButtonGroup size="small">
          <Button onClick={() => { const api = calendarRef.current?.getApi?.(); if (!api) return; api.changeView('dayGridMonth'); setTitle(api.view.title); }}>
            {t('month') || 'Month'}
          </Button>
          <Button onClick={() => { const api = calendarRef.current?.getApi?.(); if (!api) return; api.changeView('timeGridWeek'); setTitle(api.view.title); }}>
            {t('week') || 'Week'}
          </Button>
          <Button onClick={() => { const api = calendarRef.current?.getApi?.(); if (!api) return; api.changeView('timeGridDay'); setTitle(api.view.title); }}>
            {t('day') || 'Day'}
          </Button>
        </ButtonGroup>
      </Stack>

      <FullCalendarWrapper>
        {loading && (
          <Stack position="absolute" top={'45%'} left={'45%'} zIndex={10}>
            <CircularProgress size={48} />
          </Stack>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          locales={[enGb, frLocale, esLocale]}
          locale={locale as any}
          height={660}
          dateClick={(arg) => {
            if (onDateClick) onDateClick(arg.date);
          }}
          /**
           * Use promise style: return EventInput[] (or throw) instead of mixing callbacks with async.
           * Also: for identical ranges, return undefined (do nothing) so FC keeps its current events.
           */
         events={async (fetchInfo: any) => {
      const startMs = fetchInfo.start?.getTime?.() || 0;
      const endMs = fetchInfo.end?.getTime?.() || 0;

      const last = lastRangeRef.current;
      if (last && last.start === startMs && last.end === endMs) {
        // Same range as last time: return cached events
        return lastEventsRef.current;
      }

      lastRangeRef.current = { start: startMs, end: endMs };
      setLoading(true);
      try {
        const res = await api<ServerEvent<WorkOrderBase>[]>('work-orders/events', {
          method: 'POST',
          body: JSON.stringify({ start: fetchInfo.startStr, end: fetchInfo.endStr })
        });
        const events = toFcEvents(res);
        lastEventsRef.current = events; // cache for identical-range hits
        return events; // ALWAYS an array
      } catch (err) {
        // On error, keep what's currently shown by returning the cached events
        return lastEventsRef.current;
      } finally {
        setLoading(false);
      }
    }}
          dayMaxEventRows={4}
          datesSet={(arg) => {
            const viewTitle = arg.view?.title || '';
            if (lastTitleRef.current !== viewTitle) {
              lastTitleRef.current = viewTitle;
              setTitle(viewTitle);
            }
          }}
          eventClick={(info) => {
            const id = info.event.id;
            const base = searchParams ? searchParams.toString() : '';
            const params = new URLSearchParams(base);
            params.set('wo', String(id));
            router.push(`${pathname}?${params.toString()}`);
          }}
          ref={calendarRef}
        />
      </FullCalendarWrapper>
    </Box>
  );
}

const FullCalendarWrapper = styled(Box)(({ theme }) => {
  const black5 = alpha(theme.palette.common.black, 0.05);
  const black10 = alpha(theme.palette.common.black, 0.1);
  const black30 = alpha(theme.palette.common.black, 0.3);
  const black70 = alpha(theme.palette.common.black, 0.7);
  const primaryLighter = alpha(theme.palette.primary.main, 0.15);
  return `
    padding: ${theme.spacing(3)};
    position: relative;

    & .fc-license-message { display: none; }

    .fc {
      .fc-daygrid-day, .fc-timegrid-slot { cursor: pointer; }

      .fc-col-header-cell {
        padding: ${theme.spacing(1)};
        background: ${black5};
      }

      .fc-scrollgrid {
        border: 2px solid ${black10};
        border-right-width: 1px;
        border-bottom-width: 1px;
      }

      .fc-cell-shaded, .fc-list-day-cushion {
        background: ${black5};
      }

      .fc-list-event-graphic { padding-right: ${theme.spacing(1)}; }

      .fc-theme-standard td, .fc-theme-standard th,
      .fc-col-header-cell {
        border: 1px solid ${black10};
      }

      .fc-event { padding: ${theme.spacing(0.1)} ${theme.spacing(0.3)}; }

      .fc-list-day-side-text { font-weight: normal; color: ${black70}; }

      .fc-list-event:hover td,
      td.fc-daygrid-day.fc-day-today {
        background-color: ${primaryLighter};
      }

      td.fc-daygrid-day:hover,
      .fc-highlight { background: ${black10}; }

      .fc-daygrid-dot-event:hover,
      .fc-daygrid-dot-event.fc-event-mirror { background: ${primaryLighter}; }

      .fc-daygrid-day-number { padding: ${theme.spacing(1)}; font-weight: bold; }

      .fc-list-sticky .fc-list-day > * { background: ${black5} !important; }

      .fc-cell-shaded, .fc-list-day-cushion {
        background: ${black10} !important;
        color: ${black70} !important;
      }

      &.fc-theme-standard td, &.fc-theme-standard th, &.fc-theme-standard .fc-list {
        border-color: ${black30};
      }
    }
  `;
});
