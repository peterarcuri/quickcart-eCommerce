'use client';
import { productsDummyData } from '@/assets/assets';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const { user, isLoaded } = useUser(); // Add isLoaded to ensure Clerk finished loading
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

  const fetchProductData = async () => {
    
    try {

      const { data } = await axios.get('/api/product/list');

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }

  };

  const fetchUserData = async () => {
    try {
      if (!user) return; // ✅ Safeguard: don't access user if undefined

      // Check if seller safely
      setIsSeller(user?.publicMetadata?.role === 'seller');

      const token = await getToken();
      const { data } = await axios.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addToCart = async (itemId) => {
    
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;

    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    
    

    if (user) {

      try {

        const token = await getToken();

        await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}`, },})

        toast.success('Item added to cart');

      } catch (error) {
        toast.error(error.message);
      }
    }

  };

  const updateCartQuantity = (itemId, quantity) => {

    let cartData = structuredClone(cartItems);

    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);

    if (user) {
      
      try {

        const token = getToken();

        axios.post(
          '/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}`,},})

        toast.success('Cart updated');

      } catch (error) {
        toast.error(error.message);
      }
    }


  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((total, qty) => total + qty, 0);

  const getCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = products.find((p) => p._id === itemId);
      if (item) total += (item.offerPrice || 0) * cartItems[itemId];
    }
    return Math.floor(total * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (isLoaded && user) fetchUserData(); // ✅ only fetch when user is loaded
  }, [isLoaded, user]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;