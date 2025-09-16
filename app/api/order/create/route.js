import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { inngest } from "@/config/inngest";
import User from "@/models/User";
import Order from "@/models/Order";
import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request); // may be null for guest
    let { address, items, guestEmail } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }
    if (!userId && !guestEmail) {
      return NextResponse.json({ success: false, message: "Guest email is required" });
    }

    // Logged-in user: fetch full address object from DB
    if (userId) {
      const dbAddress = await Address.findById(address); // address was passed as _id
      if (!dbAddress) {
        return NextResponse.json({ success: false, message: "Address not found" });
      }
      address = {
        fullName: dbAddress.fullName,
        street: dbAddress.street,
        apartment: dbAddress.apartment || "",
        city: dbAddress.city,
        state: dbAddress.state,
        zip: dbAddress.zip,
      };
    }

    // Guest validation
    if (!userId) {
      const { fullName, street, city, state, zip } = address;
      if (!fullName || !street || !city || !state || !zip) {
        return NextResponse.json({
          success: false,
          message: "Street, City, State, ZIP, and Full Name are required",
        });
      }
    }

    // Calculate total amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json({ success: false, message: "Product not found" });
      }
      amount += product.offerPrice * item.quantity;
    }
    amount += Math.floor(amount * 0.02); // 2% fee

    // Save order
    const order = await Order.create({
      userId: userId || null,
      guestEmail: guestEmail || null,
      items,
      amount,
      address,
      date: Date.now(),
    });

    // Send order event to Inngest
    await inngest.send({
      name: "order/created",
      data: order.toObject(),
    });

    // Clear user cart if logged in
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.cartItems = {};
        await user.save();
      }
    }

    return NextResponse.json({ success: true, message: "Order Placed", order });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
