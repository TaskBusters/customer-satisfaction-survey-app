import { useTranslation } from "react-i18next"

export default function ClearSurveyModal({ open, onConfirm, onCancel }) {
  const { t } = useTranslation()
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border">
        <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
          {t("survey.clearSurveyConfirm")}
        </h2>
        <div className="mb-5 text-gray-700 text-center">
          This will erase all current survey answers.
          <br />
          Are you sure you want to clear the survey?
        </div>
        <div className="flex gap-4 justify-center mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={onConfirm}
          >
            Yes, clear
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
