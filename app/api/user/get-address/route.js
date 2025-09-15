// app/api/user/get-address/route.js

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function GET(request) {
  try {
    // Get Clerk auth info
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch all addresses for this user
    const addresses = await Address.find({ userId }).lean();

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
