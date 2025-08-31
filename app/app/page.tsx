import { redirect } from 'next/navigation';

export default function AppIndex() {
  redirect('/app/work-orders');
}
