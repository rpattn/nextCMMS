import { redirect } from 'next/navigation';

export default async function LinkAliasPage(props: { searchParams: Promise<Record<string, string | string[]>> }) {
  const params = new URLSearchParams();
  const sp = await props.searchParams;
  for (const [k, v] of Object.entries(sp || {})) {
    if (Array.isArray(v)) {
      for (const item of v) params.append(k, item);
    } else if (typeof v === 'string') {
      params.set(k, v);
    }
  }
  const qs = params.toString();
  redirect(`/oauth2/link-required${qs ? `?${qs}` : ''}`);
}
