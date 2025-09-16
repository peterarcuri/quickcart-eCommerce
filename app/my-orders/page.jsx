// app/my-orders/page.jsx
import MyOrdersClient from './MyOrdersClient';

export default function MyOrdersPage() {
  // This server component just renders the client component
  return <MyOrdersClient />;
}
