export default function AgeAndRegionRow({
  age,
  setAge,
  region,
  setRegion,
  regions,
}) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 px-6">
      <div className="flex flex-col sm:flex-row gap-6 w-full">
        {/* Age */}
        <div className="flex-1">
          <label
            htmlFor="age"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Age
          </label>
          <input
            type="number"
            id="age"
            value={age}
            min={1}
            max={120}
            onChange={(e) => setAge(e.target.value)}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Age"
          />
        </div>
        {/* Region */}
        <div className="flex-1">
          <label
            htmlFor="region"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Region of Residence
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
            autoComplete="off"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="" disabled>
              Select region
            </option>
            {regions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
