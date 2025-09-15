// app/api/user/delete-address/route.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function DELETE(request) {
  try {
    // Authenticate
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse body (axios sends `data` in request body)
    const body = await request.json();
    const { addressId } = body;

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID is required" },
        { status: 400 }
      );
    }

    // Connect DB
    await connectDB();

    // Find and delete
    const deleted = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Address not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
