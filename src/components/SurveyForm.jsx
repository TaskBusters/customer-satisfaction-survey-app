import React, { useState } from "react";
import "flowbite";
import Navbar from "./Navbar";
import ClientTypeCard from "./ClientTypeCard";
import SexCard from "./SexCard";
import AgeAndRegionRow from "./AgeAndRegionRow";
import ServiceAvailedField from "./ServiceAvailedField";

const regions = [
  { value: "NCR", label: "National Capital Region (NCR)" },
  { value: "CAR", label: "Cordillera Administrative Region (CAR)" },
  { value: "I", label: "Region I (Ilocos Region)" },
  { value: "II", label: "Region II (Cagayan Valley)" },
  { value: "III", label: "Region III (Central Luzon)" },
  { value: "IV-A", label: "Region IV-A (CALABARZON)" },
  { value: "IV-B", label: "Region IV-B (MIMAROPA)" },
  { value: "V", label: "Region V (Bicol Region)" },
  { value: "VI", label: "Region VI (Western Visayas)" },
  { value: "VII", label: "Region VII (Central Visayas)" },
  { value: "VIII", label: "Region VIII (Eastern Visayas)" },
  { value: "IX", label: "Region IX (Zamboanga Peninsula)" },
  { value: "X", label: "Region X (Northern Mindanao)" },
  { value: "XI", label: "Region XI (Davao Region)" },
  { value: "XII", label: "Region XII (SOCCSKSARGEN)" },
  { value: "XIII", label: "Region XIII (Caraga)" },
  {
    value: "BARMM",
    label: "BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)",
  },
];

export default function SurveyForm({
  username = "Guest",
  onNext,
  onExit,
  onSettings,
  onLogin,
  onSignUp,
}) {
  const [clientType, setClientType] = useState("");
  const [clientOther, setClientOther] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [service, setService] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNext) {
      onNext({
        clientType: clientType === "others" ? clientOther : clientType,
        sex,
        age,
        region,
        service,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="
            bg-white text-black 
            w-full max-w-4xl min-h-[75vh]
            rounded-2xl shadow-2xl
            flex flex-col gap-8
            px-12 py-14
            mx-2
            items-center
            justify-center
          "
        >
          <h2 className="text-3xl text-blue-600 font-bold text-center mb-3">
            Survey Form - Personal Information
          </h2>

          <ClientTypeCard
            clientType={clientType}
            setClientType={setClientType}
            clientOther={clientOther}
            setClientOther={setClientOther}
          />
          <SexCard sex={sex} setSex={setSex} />
          <AgeAndRegionRow
            age={age}
            setAge={setAge}
            region={region}
            setRegion={setRegion}
            regions={regions}
          />
          <ServiceAvailedField service={service} setService={setService} />

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 
              focus:ring-4 focus:outline-black focus:ring-blue-300 
              font-medium rounded-lg text-sm px-5 py-2.5 text-center
              mx-auto block sm:w-40 md:w-48 w-full"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
