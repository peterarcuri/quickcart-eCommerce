// app/api/user/update-address/route.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { addressId, address } = await request.json();
    if (!addressId || !address) {
      return NextResponse.json(
        { success: false, message: "Address ID and updated data are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId }, // ensure ownership
      { $set: address },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Address not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
