import { getAuth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";  // 👈 import factory
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// initialize Clerk client with your secret key
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    let user = await User.findById(userId);

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        _id: userId,
        name:
          clerkUser.fullName ||
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        imageUrl: clerkUser.imageUrl || "",
        cartItems: {},
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
