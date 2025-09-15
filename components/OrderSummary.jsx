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
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    area: "",
    city: "",
    state: "",
  });

  // ✅ Fetch addresses
  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Select
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  // ✅ Start editing
  const handleEdit = (address) => {
    setEditingAddress(address._id);
    setFormData({
      fullName: address.fullName,
      area: address.area,
      city: address.city,
      state: address.state,
    });
  };

  // ✅ Cancel edit
  const handleCancelEdit = () => {
    setEditingAddress(null);
    setFormData({ fullName: "", area: "", city: "", state: "" });
  };

  // ✅ Save updated address
  const handleUpdate = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.put(
        "/api/user/update-address",
        { addressId: editingAddress, address: formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setUserAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddress ? { ...addr, ...formData } : addr
          )
        );
        if (selectedAddress && selectedAddress._id === editingAddress) {
          setSelectedAddress({ ...selectedAddress, ...formData });
        }
        toast.success("Address updated!");
        handleCancelEdit();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Delete address
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete("/api/user/delete-address", {
        headers: { Authorization: `Bearer ${token}` },
        data: { addressId: id },
      });

      if (data.success) {
        setUserAddresses((prev) => prev.filter((addr) => addr._id !== id));
        if (selectedAddress && selectedAddress._id === id) {
          setSelectedAddress(null);
        }
        toast.success("Address deleted!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createOrder = async () => {
    // 🛠️ will hook into order API later
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />

      <div className="space-y-6">
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
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address) => (
                  <li
                    key={address._id}
                    className="px-4 py-2 hover:bg-gray-500/10"
                  >
                    {editingAddress === address._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          placeholder="Full Name"
                          className="border p-1 w-full"
                        />
                        <input
                          type="text"
                          value={formData.area}
                          onChange={(e) =>
                            setFormData({ ...formData, area: e.target.value })
                          }
                          placeholder="Area"
                          className="border p-1 w-full"
                        />
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          placeholder="City"
                          className="border p-1 w-full"
                        />
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          placeholder="State"
                          className="border p-1 w-full"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdate}
                            className="bg-green-600 text-white px-3 py-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-400 text-white px-3 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span
                          onClick={() => handleAddressSelect(address)}
                          className="cursor-pointer"
                        >
                          {address.fullName}, {address.area}, {address.city},{" "}
                          {address.state}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(address)}
                            className="text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(address._id)}
                            className="text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Promo code */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        {/* Totals */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {getCartAmount()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {getCartAmount() + Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
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
