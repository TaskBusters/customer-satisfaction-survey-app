export default function ClientTypeCard({
  clientType,
  setClientType,
  clientOther,
  setClientOther,
}) {
  return (
    <div className="bg-gray-50 rounded-xl shadow p-6 mb-6 w-full max-w-2xl">
      <label className="mb-2 block text-lg font-bold text-black">
        Client Type
      </label>
      <div className="flex flex-col items-center w-full">
        <div className="flex w-full flex-col sm:flex-row justify-center gap-4 mb-2">
          {["Citizen", "Business", "Government"].map((type) => (
            <div
              key={type}
              className="flex flex-row justify-center items-center flex-1"
            >
              <input
                id={`client-type-${type}`}
                type="radio"
                value={type}
                name="client-type"
                checked={clientType === type}
                onChange={() => setClientType(type)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300
                  focus:ring-blue-500 dark:focus:ring-blue-600 
                  dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor={`client-type-${type}`}
                className="ms-2 text-lg font-medium text-black"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
        {/* Others (below main options) */}
        <div className="flex justify-center items-center w-full mt-2">
          <input
            id="client-type-others"
            type="radio"
            value="others"
            name="client-type"
            checked={clientType === "others"}
            onChange={() => setClientType("others")}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 
              focus:ring-blue-500 dark:focus:ring-blue-600 
              dark:ring-offset-gray-800 focus:ring-2 
              dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="client-type-others"
            className="ms-2 text-lg font-medium text-black"
          >
            Others
          </label>
          <input
            type="text"
            id="others"
            disabled={clientType !== "others"}
            value={clientOther}
            onChange={(e) => setClientOther(e.target.value)}
            className={`ml-2 w-40 px-2 py-1 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500
              ${
                clientType !== "others"
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-gray-50"
              }
            `}
            placeholder="Please specify"
          />
        </div>
      </div>
    </div>
  );
}
