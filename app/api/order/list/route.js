import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request);
    const { searchParams } = new URL(request.url);

    const orderId = searchParams.get("orderId");       // ✅ Fetch single order by ID
    const guestEmail = searchParams.get("guestEmail"); // For guest orders

    let orders;

    if (orderId) {
      // Fetch a single order by _id (used for post-checkout immediate display)
      orders = await Order.find({ _id: orderId }).populate("items.product");
    } else if (userId) {
      // Logged-in user: fetch all orders by userId
      orders = await Order.find({ userId }).populate("items.product");
    } else {
      // Guest: fetch all orders by guestEmail
      if (!guestEmail) {
        return NextResponse.json(
          { success: false, message: "guestEmail required for guest orders" },
          { status: 400 }
        );
      }
      orders = await Order.find({ guestEmail }).populate("items.product");
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
