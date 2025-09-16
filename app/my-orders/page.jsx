'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const newOrderId = searchParams.get("newOrderId"); // Check if a new order was just placed

  const fetchOrders = async () => {
    try {
      let response;

      if (newOrderId) {
        // ✅ Fetch only the newly placed order
        response = await axios.get(`/api/order/list?orderId=${newOrderId}`);
      } else if (user) {
        // Logged-in user → fetch all orders
        const token = await getToken();
        response = await axios.get("/api/order/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Guest user → fetch all guest orders using localStorage
        const guestEmail = localStorage.getItem("guestEmail");
        if (!guestEmail) {
          setLoading(false);
          return;
        }
        response = await axios.get(`/api/order/list?guestEmail=${guestEmail}`);
      }

      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, newOrderId]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>
          {loading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order, index) => (
                <div
                  key={index}
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
                        {order.items
                          .map(
                            (item) => `${item.product.name} x ${item.quantity}`
                          )
                          .join(", ")}
                      </span>
                      <span>Items : {order.items.length}</span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">{order.address.fullName}</span>
                      <br />
                      <span>{order.address.street}</span>
                      <br />
                      {order.address.apartment && (
                        <span>{order.address.apartment}, </span>
                      )}
                      <span>{`${order.address.city}, ${order.address.state}`}</span>
                      <br />
                      <span>{order.address.zip}</span>
                    </p>
                  </div>
                  <p className="font-medium my-auto">
                    {currency}
                    {order.amount}
                  </p>
                  <div>
                    <p className="flex flex-col">
                      <span>Method : COD</span>
                      <span>Date : {new Date(order.date).toLocaleDateString()}</span>
                      <span>Status : {order.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
