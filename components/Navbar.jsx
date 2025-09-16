'use client';
import React, { useState, useEffect } from 'react';
import { assets, CartIcon } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { useClerk } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

const Navbar = () => {
  const { isSeller, router, user, getCartCount } = useAppContext();
  const { openSignIn } = useClerk();
  const isUserLoggedIn = !!user;

  const [cartCount, setCartCount] = useState(getCartCount());
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const newCount = getCartCount();
    if (newCount !== cartCount) {
      setCartCount(newCount);
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [getCartCount()]); // works now because getCartCount is a function

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      {/* Logo */}
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />

      {/* Cart + User */}
      <div className="flex items-center gap-4 relative">
        {/* Cart */}
        <button
          onClick={() => router.push('/cart')}
          className="relative flex items-center"
        >
          <CartIcon className="w-6 h-6" />
          {cartCount > 0 && (
            <span
              className={`absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center transform transition-transform ${
                animate ? 'scale-125' : 'scale-100'
              }`}
            >
              {cartCount}
            </span>
          )}
        </button>

        {isUserLoggedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
