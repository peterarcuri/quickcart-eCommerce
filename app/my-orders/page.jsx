'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { assets } from "@/assets/assets";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function MyOrdersPage() {
  const { currency, getToken } = useAppContext();
  const { user } = useUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderId, setNewOrderId] = useState(null);

  // Only read search params inside useEffect (client-only)
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams) {
      setNewOrderId(searchParams.get("newOrderId"));
    }
  }, [searchParams]);

  // Fetch orders client-side
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let response;

        if (user) {
          // Logged-in user
          const token = await getToken();
          response = await axios.get("/api/order/list", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (newOrderId) {
          // Guest new order
          response = await axios.get(`/api/order/list?orderId=${newOrderId}`);
        } else {
          // Guest stored orders
          const guestEmail = localStorage.getItem("guestEmail");
          if (!guestEmail) {
            setOrders([]);
            setLoading(false);
            return;
          }
          response = await axios.get(`/api/order/list?guestEmail=${guestEmail}`);
        }

        if (response?.data?.success) {
          setOrders(response.data.orders.reverse());
        } else {
          toast.error(response?.data?.message || "Failed to fetch orders.");
        }
      } catch (err) {
        toast.error(err?.message || "Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, newOrderId, getToken]);

  return (
    <>
      <Navbar />
      <main className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>
          {loading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                >
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="max-w-16 max-h-16 object-cover"
                      src={assets.box_icon}
                      alt="box_icon"
                    />
                    <p className="flex flex-col gap-3">
                      <span className="font-medium text-base">
                        {order.items.map((item) => `${item.product.name} x ${item.quantity}`).join(", ")}
                      </span>
                      <span>Items: {order.items.length}</span>
                    </p>
                  </div>

                  <div>
                    <p>
                      <span className="font-medium">{order.address.fullName}</span>
                      <br />
                      <span>{order.address.street}</span>
                      {order.address.apartment && <span>, {order.address.apartment}</span>}
                      <br />
                      <span>{`${order.address.city}, ${order.address.state}`}</span>
                      <br />
                      <span>{order.address.zip}</span>
                    </p>
                  </div>

                  <p className="font-medium my-auto">
                    {currency}{order.amount}
                  </p>

                  <div>
                    <p className="flex flex-col">
                      <span>Method: {order.method || "COD"}</span>
                      <span>Date: {new Date(order.date).toLocaleDateString()}</span>
                      <span>Status: {order.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
