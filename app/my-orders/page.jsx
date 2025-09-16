import MyOrdersClient from './MyOrdersClient';

export const dynamic = 'force-dynamic';

export default function MyOrdersPage() {
  // This parent component is server-rendered only and simply renders the client component
  return <MyOrdersClient />;
}
