import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { APIURL } from "@/url.config";

export function PhoneLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const businessId = localStorage.getItem("businessId");
    if (businessId) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    localStorage.setItem("phoneNumberStored", fullPhoneNumber)
    try {
      const response = await fetch(`${APIURL}/api/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: fullPhoneNumber }),
      });

      if (response.ok) {
        navigate("/verify", { state: { phoneNumber: fullPhoneNumber } });
      } else {
        const data = await response.json();
        alert(data.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="phone">
          Phone number
        </label>
        <div className="flex gap-2">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+91">IN +91</SelectItem>
              <SelectItem value="+1">US +1</SelectItem>
              <SelectItem value="+44">UK +44</SelectItem>
            </SelectContent>
          </Select>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {loading ? "Sending OTP..." : "GET OTP"}
      </Button>
    </form>
  );
}
