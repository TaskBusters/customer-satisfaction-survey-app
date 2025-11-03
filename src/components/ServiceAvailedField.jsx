export default function ServiceAvailedField({ service, setService }) {
  return (
    <div className="mb-6 w-full max-w-2xl">
      <label
        htmlFor="service"
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        Service Availed
      </label>
      <input
        type="text"
        id="service"
        value={service}
        onChange={(e) => setService(e.target.value)}
        required
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
          focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="Describe the service"
      />
    </div>
  );
}
