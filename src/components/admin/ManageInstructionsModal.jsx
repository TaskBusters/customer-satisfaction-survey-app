"use client"

import { useState, useEffect } from "react"

const CATEGORIES = ["Personal Info", "Citizen's Charter Awareness", "Service Satisfaction", "Feedback"]

export default function ManageInstructionsModal({ open, existingInstructions, onSave, onCancel }) {
  const [instruction, setInstruction] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0])
  const [hasExisting, setHasExisting] = useState(false)
  const [categoriesWithInstructions, setCategoriesWithInstructions] = useState({})

  useEffect(() => {
    if (existingInstructions) {
      setCategoriesWithInstructions(existingInstructions)
      // Find first category without instructions to show, or show first with
      const categoryWithoutInstructions = CATEGORIES.find((cat) => !existingInstructions[cat])
      if (categoryWithoutInstructions) {
        setSelectedCategory(categoryWithoutInstructions)
        setInstruction("")
        setHasExisting(false)
      } else {
        setSelectedCategory(CATEGORIES[0])
        setInstruction(existingInstructions[CATEGORIES[0]] || "")
        setHasExisting(!!existingInstructions[CATEGORIES[0]])
      }
    }
  }, [open, existingInstructions])

  useEffect(() => {
    if (selectedCategory && categoriesWithInstructions[selectedCategory]) {
      setInstruction(categoriesWithInstructions[selectedCategory])
      setHasExisting(true)
    } else {
      setInstruction("")
      setHasExisting(false)
    }
  }, [selectedCategory, categoriesWithInstructions])

  if (!open) return null

  const handleSave = () => {
    if (!instruction.trim()) {
      alert("Please enter instructions")
      return
    }

    if (
      hasExisting &&
      categoriesWithInstructions[selectedCategory] &&
      categoriesWithInstructions[selectedCategory] !== instruction
    ) {
      alert("This category already has instructions. Edit the existing ones or delete them first.")
      return
    }

    onSave(selectedCategory, instruction)
    setInstruction("")
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hasExisting ? "Edit" : "Add"} Instructions</h2>
            <p className="text-sm text-gray-600 mt-1">Manage instructions for survey sections</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Select Category *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-3 rounded-lg border-2 font-medium transition text-left ${
                    selectedCategory === cat
                      ? "border-purple-500 bg-purple-50 text-purple-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm">{cat}</div>
                  <div className="text-xs mt-1">
                    {categoriesWithInstructions[cat] ? "✓ Has instructions" : "No instructions yet"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Info */}
          <div
            className={`p-4 rounded-lg border ${
              hasExisting ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"
            }`}
          >
            <p className={`text-sm font-medium ${hasExisting ? "text-blue-700" : "text-amber-700"}`}>
              {hasExisting
                ? "📝 Editing existing instructions for this category"
                : "➕ No instructions for this category yet. Add new ones."}
            </p>
            {!categoriesWithInstructions[selectedCategory] && hasExisting && (
              <p className="text-xs text-gray-600 mt-2">
                This category already has instructions assigned. You can only edit them here.
              </p>
            )}
          </div>

          {/* Instructions Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Instructions <span className="text-red-600">*</span>
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
              placeholder="Enter detailed instructions for this section..."
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-2">{instruction.length} characters</p>
          </div>

          {/* Info Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>💡 Note:</strong> Each section can have only one set of instructions. These will be displayed to
              users at the beginning of that survey section.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
          >
            {hasExisting ? "Update Instructions" : "Add Instructions"}
          </button>
        </div>
      </div>
    </div>
  )
}
