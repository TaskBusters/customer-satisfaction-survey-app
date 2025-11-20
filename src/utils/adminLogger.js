import { API_BASE_URL } from "./api.js";

export const logAdminAction = async (email, name, action) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/log-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admin_email: email,
        admin_name: name,
        action: action,
      }),
    })
    if (!response.ok) {
      console.error("[v0] Failed to log admin action")
    }
  } catch (error) {
    console.error("[v0] Admin logging error:", error)
  }
}
