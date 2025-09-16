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
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      if (!user) return;

      setIsSeller(user?.publicMetadata?.role === 'seller');

      const token = await getToken();
      const { data } = await axios.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addToCart = async (itemId) => {
    const newCart = { ...cartItems };
    newCart[itemId] = (newCart[itemId] || 0) + 1;
    setCartItems(newCart);

    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData: newCart }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Item added to cart');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    const newCart = { ...cartItems };
    if (quantity <= 0) delete newCart[itemId];
    else newCart[itemId] = quantity;
    setCartItems(newCart);

    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData: newCart }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Cart updated');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // ✅ Make getCartCount a proper function
  const getCartCount = () => {
    return Object.values(cartItems).reduce((total, qty) => total + qty, 0);
  };

  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      const item = products.find((p) => p._id === itemId);
      if (item) total += (item.offerPrice || 0) * qty;
      return total;
    }, 0);
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (isLoaded && user) fetchUserData();
  }, [isLoaded, user]);

  return (
    <AppContext.Provider
      value={{
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
        getCartCount, // ✅ now callable as a function
        getCartAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
