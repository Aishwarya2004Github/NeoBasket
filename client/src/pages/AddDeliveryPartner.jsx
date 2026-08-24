import React, { useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";

const AddDeliveryPartner = () => {
  const [data, setData] = useState({
    employeeId: "",
    name: "",
    age: "",
    gender: "",
    mobile: "",
    email: "",
    password: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("employeeId", data.employeeId);
      formData.append("name", data.name);
      formData.append("age", data.age);
      formData.append("gender", data.gender);
      formData.append("mobile", data.mobile);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("address", data.address);

      if (photo) {
        formData.append("photo", photo);
      }

      const response = await Axios({
        ...SummaryApi.createDeliveryPartner,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("CREATE PARTNER RESPONSE:", response.data);

      if (response.data.success) {
        toast.success(response.data.message);

        setData({
          employeeId: "",
          name: "",
          age: "",
          gender: "",
          mobile: "",
          email: "",
          password: "",
          address: "",
        });

        setPhoto(null);

        document.getElementById("photoInput").value = "";
      }
    } catch (error) {
      console.log("CREATE PARTNER ERROR:", error);

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // Inputs ke visual visibility ke liye common styles
  const inputStyle =
    "w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden transition-all">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Add Delivery Partner
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            Fill in the details below to onboard a new delivery team member.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={submitHandler} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                placeholder="e.g. EMP-102"
                value={data.employeeId}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. John Doe"
                value={data.name}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Age
              </label>
              <input
                type="number"
                name="age"
                placeholder="e.g. 25"
                value={data.age}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={data.gender}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="e.g. +91 9876543210"
                value={data.mobile}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={data.email}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={data.password}
              onChange={handleChange}
              className={inputStyle}
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Address
            </label>
            <textarea
              name="address"
              placeholder="Street name, landmark, city, etc."
              value={data.address}
              onChange={handleChange}
              className={`${inputStyle} resize-none`}
              rows={3}
              required
            />
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Profile Photo
            </label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-orange-500 transition-colors bg-slate-50 text-center cursor-pointer">
              <input
                id="photoInput"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-slate-700 text-sm font-semibold">
                  Click or drag image to upload
                </span>
                <span className="text-slate-500 text-xs">
                  PNG, JPG, or WEBP (Max 5MB)
                </span>
              </div>
            </div>

            {photo && (
              <div className="mt-2 flex items-center justify-between bg-orange-50 border border-orange-200 text-orange-900 px-3 py-2 rounded-md text-xs font-medium">
                <span className="truncate max-w-xs">
                  Selected: {photo.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    document.getElementById("photoInput").value = "";
                  }}
                  className="text-orange-700 hover:text-orange-900 underline font-bold ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding Partner...
              </span>
            ) : (
              "Add Delivery Partner"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDeliveryPartner;