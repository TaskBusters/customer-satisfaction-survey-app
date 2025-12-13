export default function NotificationBar({ message, onClear, msgType = "success" }) {
  if (!message) return null

  const getStyles = () => {
    switch (msgType) {
      case "error":
        return "bg-red-50 border border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border border-yellow-200 text-yellow-800"
      case "info":
        return "bg-blue-50 border border-blue-200 text-blue-800"
      case "success":
      default:
        return "bg-green-50 border border-green-200 text-green-800"
    }
  }

  return (
    <div className={`rounded mb-4 p-3 flex justify-between items-center ${getStyles()}`}>
      <span className="font-medium">{message}</span>
      <button className="ml-4 px-2 py-1 rounded hover:opacity-80 text-sm font-medium" onClick={onClear}>
        Dismiss
      </button>
    </div>
  )
}
