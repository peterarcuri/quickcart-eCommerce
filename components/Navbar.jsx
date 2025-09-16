'use client';
import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const Navbar = () => {
  const { user, isSignedIn } = useUser();

  return (
    <nav className="flex justify-between items-center px-6 md:px-16 lg:px-32 py-4 border-b border-gray-300 bg-white sticky top-0 z-50">
      <div className="text-xl font-bold">
        <Link href="/">QuickCart</Link>
      </div>
      <ul className="flex gap-6 items-center">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/my-orders">My Orders</Link>
        </li>
        {isSignedIn ? (
          <li>
            <button className="px-4 py-2 bg-orange-500 text-white rounded">Logout</button>
          </li>
        ) : (
          <li>
            <Link href="/sign-in">Sign In</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
