import React, { useState } from "react";
import { Button, Label, Radio, TextInput, Select } from "flowbite-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./Navbar";

// Sample props for demonstration
const username = "Guest";
const onExit = () => {};
const onSettings = () => {};
const onLogin = () => {};
const onSignUp = () => {};

const regionList = [
  "NCR",
  "CAR",
  "Region I",
  "Region II",
  "Region III",
  "Region IV-A",
  "Region IV-B",
  "Region V",
  "Region VI",
  "Region VII",
  "Region VIII",
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "BARMM",
];

export default function ClientDetailsForm({ onNext }) {
  const [clientType, setClientType] = useState("");
  const [clientOther, setClientOther] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [date, setDate] = useState(null);
  const [region, setRegion] = useState("");
  const [service, setService] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext &&
      onNext({
        clientType: clientType === "others" ? clientOther : clientType,
        sex,
        age,
        date,
        region,
        service,
      });
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#eaeaea]">
      {/* Navbar at the top */}
      <Navbar
        username={username}
        onExit={onExit}
        onSettings={onSettings}
        onLogin={onLogin}
        onSignUp={onSignUp}
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg mx-auto my-8 p-8 rounded-lg shadow-lg flex flex-col gap-6"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Client Details
        </h2>

        {/* Client Type */}
        <div>
          <Label className="mb-2 block font-medium">Client Type</Label>
          <div className="flex flex-wrap gap-3">
            {["Citizen", "Business", "Government"].map((type) => (
              <Label key={type} className="flex items-center gap-2">
                <Radio
                  name="clientType"
                  value={type}
                  checked={clientType === type}
                  onChange={() => setClientType(type)}
                />
                {type}
              </Label>
            ))}
            <Label className="flex items-center gap-2">
              <Radio
                name="clientType"
                value="others"
                checked={clientType === "others"}
                onChange={() => setClientType("others")}
              />
              Others
              <TextInput
                disabled={clientType !== "others"}
                value={clientOther}
                onChange={(e) => setClientOther(e.target.value)}
                className="w-28"
                placeholder="Please specify"
                size={8}
              />
            </Label>
          </div>
        </div>

        {/* Sex */}
        <div>
          <Label className="mb-2 block font-medium">Sex</Label>
          <div className="flex gap-5">
            <Label className="flex items-center gap-2">
              <Radio
                name="sex"
                value="Male"
                checked={sex === "Male"}
                onChange={() => setSex("Male")}
              />
              Male
            </Label>
            <Label className="flex items-center gap-2">
              <Radio
                name="sex"
                value="Female"
                checked={sex === "Female"}
                onChange={() => setSex("Female")}
              />
              Female
            </Label>
          </div>
        </div>

        {/* Age & Date row */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="age" className="mb-2 block font-medium">
              Age
            </Label>
            <TextInput
              id="age"
              type="number"
              value={age}
              min={1}
              max={120}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              required
            />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block font-medium">Date</Label>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              placeholderText="Select Date"
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2"
              dateFormat="yyyy-MM-dd"
              required
            />
          </div>
        </div>

        {/* Region */}
        <div>
          <Label className="mb-2 block font-medium">Region of Residence</Label>
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          >
            <option value="">Select region</option>
            {regionList.map((reg, idx) => (
              <option value={reg} key={idx}>
                {reg}
              </option>
            ))}
          </Select>
        </div>

        {/* Service Availed */}
        <div>
          <Label htmlFor="service" className="mb-2 block font-medium">
            Service Availed
          </Label>
          <TextInput
            id="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Describe the service"
            required
          />
        </div>

        {/* Next button */}
        <button type="submit" className="w-full mt-4">
          Next
        </button>
      </form>
    </div>
  );
}
