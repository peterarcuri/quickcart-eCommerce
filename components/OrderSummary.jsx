import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    getToken,
    user,
    cartItems,
    setCartItems,
  } = useAppContext();

  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    email: "",
    fullName: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
  });

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);

  // Fetch addresses for logged-in users
  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user && !isGuest) fetchUserAddresses();
  }, [user, isGuest]);

  // Create order
// ✅ Create order (supports guest and logged-in users)
const createOrder = async () => {
  try {
    // Convert cartItems to array
    const cartItemsArray = Object.entries(cartItems || {})
      .map(([productId, quantity]) => ({ product: productId, quantity }))
      .filter((item) => item.quantity > 0);

    if (cartItemsArray.length === 0) {
      return toast.error("Your cart is empty");
    }

    let payload = { items: cartItemsArray };

    if (isGuest) {
      // Guest checkout
      const { email, fullName, street, apartment, city, state, zip } = guestInfo;

      if (!email || !fullName || !street || !city || !state || !zip) {
        return toast.error("Please fill all required guest fields");
      }

      payload = {
        ...payload,
        guestEmail: email,
        address: { fullName, street, apartment: apartment || "", city, state, zip },
      };
    } else {
      // ✅ Logged-in user checkout: copy full address object instead of _id
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      payload.address = {
        fullName: selectedAddress.fullName,
        street: selectedAddress.street,
        apartment: selectedAddress.apartment || "",
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
      };
    }

    // Send request
    const headers = user && !isGuest ? { Authorization: `Bearer ${await getToken()}` } : {};
    const { data } = await axios.post("/api/order/create", payload, { headers });

    if (data.success) {
      toast.success(data.message);
    
      // ✅ Save guestEmail so /my-orders can fetch orders later
      if (isGuest) {
        localStorage.setItem("guestEmail", guestInfo.email);
      }
    
      setCartItems({});
      router.push(`/my-orders?newOrderId=${data.order._id}`);
    } else {
      toast.error(data.message);
    }
    

  } catch (error) {
    console.error("❌ Error placing order:", error);
    toast.error(`Error placing order: ${error.message}`);
  }
};



  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />

      {/* Guest Checkout Toggle */}
      {!user && (
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isGuest}
              onChange={() => setIsGuest(!isGuest)}
            />
            <span className="text-gray-700">Checkout as Guest</span>
          </label>
        </div>
      )}

      {isGuest ? (
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={guestInfo.email}
            onChange={(e) =>
              setGuestInfo({ ...guestInfo, email: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={guestInfo.fullName}
            onChange={(e) =>
              setGuestInfo({ ...guestInfo, fullName: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="Street Address"
            value={guestInfo.street}
            onChange={(e) =>
              setGuestInfo({ ...guestInfo, street: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="Apartment, Suite, Unit (optional)"
            value={guestInfo.apartment}
            onChange={(e) =>
              setGuestInfo({ ...guestInfo, apartment: e.target.value })
            }
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="City"
            value={guestInfo.city}
            onChange={(e) =>
              setGuestInfo({ ...guestInfo, city: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={guestInfo.state}
            onChange={(e) =>
              setGuestInfo({ ...guestInfo, state: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="ZIP / Postal Code"
            value={guestInfo.zip}
            onChange={(e) =>
              setGuestInfo({ ...guestInfo, zip: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
        </div>
      ) : (
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip}`
                  : "Select Address"}
              </span>
            </button>
            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address) => (
                  <li
                    key={address._id}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => setSelectedAddress(address)}
                  >
                    {address.fullName}, {address.street}{" "}
                    {address.apartment && `, ${address.apartment}`},{" "}
                    {address.city}, {address.state}, {address.zip}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 text-center cursor-pointer"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>
      )}

      <hr className="border-gray-500/30 my-5" />

      {/* Totals */}
      <div className="space-y-4">
        <div className="flex justify-between text-base font-medium">
          <p className="uppercase text-gray-600">Items {getCartCount()}</p>
          <p className="text-gray-800">{currency}{getCartAmount()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-600">Shipping Fee</p>
          <p className="font-medium text-gray-800">Free</p>
        </div>
        <div className="flex justify-between text-gray-600">
          <p>Tax (2%)</p>
          <p>{currency}{Math.floor(getCartAmount() * 0.02)}</p>
        </div>
        <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
          <p>Total</p>
          <p>{currency}{getCartAmount() + Math.floor(getCartAmount() * 0.02)}</p>
        </div>
      </div>

      <button
        onClick={createOrder}
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
