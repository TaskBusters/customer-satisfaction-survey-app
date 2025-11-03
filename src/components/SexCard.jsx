export default function SexCard({ sex, setSex }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow p-6 mb-6 w-full max-w-2xl">
      <label className="mb-2 block text-lg font-bold text-black">Sex</label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center mb-2">
          <input
            id="sex-male"
            type="radio"
            value="Male"
            name="sex"
            checked={sex === "Male"}
            onChange={() => setSex("Male")}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300
              focus:ring-blue-500 dark:focus:ring-blue-600 
              dark:ring-offset-gray-800 focus:ring-2 
              dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="sex-male"
            className="ms-2 text-lg font-medium text-black"
          >
            Male
          </label>
        </div>
        <div className="flex items-center mb-2">
          <input
            id="sex-female"
            type="radio"
            value="Female"
            name="sex"
            checked={sex === "Female"}
            onChange={() => setSex("Female")}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300
              focus:ring-blue-500 dark:focus:ring-blue-600 
              dark:ring-offset-gray-800 focus:ring-2 
              dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="sex-female"
            className="ms-2 text-lg font-medium text-black"
          >
            Female
          </label>
        </div>
      </div>
    </div>
  );
}
