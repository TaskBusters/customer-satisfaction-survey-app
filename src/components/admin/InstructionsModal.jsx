import { useState, useEffect } from "react"

export default function InstructionsModal({ open, section, existingInstruction, onSave, onCancel }) {
  const [instruction, setInstruction] = useState("")

  useEffect(() => {
    if (existingInstruction) {
      setInstruction(existingInstruction)
    } else {
      setInstruction("")
    }
  }, [existingInstruction, open])

  if (!open) return null

  const handleSave = () => {
    onSave(instruction)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          {existingInstruction ? "Edit" : "Add"} Instructions for {section}
        </h2>

        <div className="mb-4">
          <label className="block font-semibold mb-2">Instructions</label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter instructions for this section..."
            rows={5}
          />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Each section ({section}) can only have one set of instructions. Edit this instruction or leave it blank.
        </p>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded font-semibold">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">
            {existingInstruction ? "Update" : "Add"} Instructions
          </button>
        </div>
      </div>
    </div>
  )
}
