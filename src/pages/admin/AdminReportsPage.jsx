"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { API_BASE_URL } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext"
import { logAdminAction } from "../../utils/adminLogger"
import { jsPDF } from "jspdf"
// import "jspdf-autotable" // Import jsPDF autoTable - removed as manual table generation is used

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allResponses, setAllResponses] = useState([])
  const [serviceFilter, setServiceFilter] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [services, setServices] = useState([])

  const canExport = () => {
    if (!user) return false
    const userRole = (user.role || "").toLowerCase().trim()
    return (
      userRole === "superadmin" ||
      userRole === "system admin" ||
      userRole === "surveyadmin" ||
      userRole === "survey admin" ||
      userRole === "analyst" ||
      userRole === "report viewer"
    )
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const serviceParam = serviceFilter ? `&serviceFilter=${encodeURIComponent(serviceFilter)}` : ""
        const regionParam = regionFilter ? `&regionFilter=${encodeURIComponent(regionFilter)}` : ""
        const dateFromParam = dateFromFilter ? `&dateFromFilter=${encodeURIComponent(dateFromFilter)}` : ""
        const dateToParam = dateToFilter ? `&dateToFilter=${encodeURIComponent(dateToFilter)}` : ""

        const [analyticsData, responsesData] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/analytics?${serviceParam}${regionParam}${dateFromParam}${dateToParam}`).then(
            (r) => r.json(),
          ),
          fetch(`${API_BASE_URL}/api/admin/submissions`).then((r) => r.json()),
        ])

        setAnalytics(analyticsData)
        const processedResponses = (responsesData || []).map((r) => {
          if (r.response_data && typeof r.response_data === "string") {
            try {
              const parsed = JSON.parse(r.response_data)
              return { ...r, ...parsed }
            } catch (e) {
              return r
            }
          }
          return r
        })
        setAllResponses(processedResponses)

        const uniqueServices = [...new Set(responsesData?.map((r) => r.service).filter(Boolean))]
        setServices(uniqueServices)
        setLoading(false)
      } catch (err) {
        console.error("Failed to load analytics:", err)
        setLoading(false)
      }
    }
    loadData()
  }, [serviceFilter, regionFilter, dateFromFilter, dateToFilter])

  const getFilteredAnalytics = () => {
    let filtered = allResponses
    if (serviceFilter) filtered = filtered.filter((r) => r.service === serviceFilter)
    if (regionFilter) filtered = filtered.filter((r) => r.region === regionFilter)
    if (dateFromFilter || dateToFilter) {
      filtered = filtered.filter((r) => {
        if (!r.submitted_at) return false

        // Convert timestamp to local date string (YYYY-MM-DD)
        const submittedDate = new Date(r.submitted_at).toLocaleDateString("en-CA") // en-CA gives YYYY-MM-DD format

        if (dateFromFilter && dateToFilter) {
          return submittedDate >= dateFromFilter && submittedDate <= dateToFilter
        } else if (dateFromFilter) {
          return submittedDate >= dateFromFilter
        } else if (dateToFilter) {
          return submittedDate <= dateToFilter
        }
        return true
      })
    }
    return filtered
  }

  const calculateSQDDistribution = () => {
    const sqdData = {}
    getFilteredAnalytics().forEach((r) => {
      try {
        const sqdRatings = typeof r.sqd_ratings === "string" ? JSON.parse(r.sqd_ratings) : r.sqd_ratings || {}
        Object.entries(sqdRatings).forEach(([key, val]) => {
          if (val !== "NA" && typeof val === "number") {
            sqdData[key] = (sqdData[key] || 0) + 1
          }
        })
      } catch (e) {
        console.error("Error parsing SQD ratings:", e)
      }
    })
    return Object.entries(sqdData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }

  const calculateSQDDimension = (dimension) => {
    const ratingCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, NA: 0 }
    getFilteredAnalytics().forEach((r) => {
      try {
        const sqdRatings = typeof r.sqd_ratings === "string" ? JSON.parse(r.sqd_ratings) : r.sqd_ratings || {}
        const rating = sqdRatings[dimension]
        if (rating === "NA") {
          ratingCounts["NA"]++
        } else if (typeof rating === "number" && rating >= 0 && rating <= 8) {
          ratingCounts[rating]++
        }
      } catch (e) {
        console.error("Error parsing SQD ratings:", e)
      }
    })
    return Object.entries(ratingCounts)
      .map(([rating, count]) => ({
        rating: rating === "N/A" ? "N/A" : rating === "N/A" ? "N/A" : `Rating ${rating}`,
        count,
      }))
      .filter((item) => item.count > 0)
  }

  // Calculate Total Satisfaction Distribution
  const calculateSatisfactionDistribution = () => {
    const satisfactionRanges = {
      "0-1": 0,
      "1-2": 0,
      "2-3": 0,
      "3-4": 0,
      "4-5": 0,
    }
    getFilteredAnalytics().forEach((r) => {
      const satisfaction = Number.parseFloat(r.average_satisfaction || 0)
      if (satisfaction >= 0 && satisfaction < 1) satisfactionRanges["0-1"]++
      else if (satisfaction >= 1 && satisfaction < 2) satisfactionRanges["1-2"]++
      else if (satisfaction >= 2 && satisfaction < 3) satisfactionRanges["2-3"]++
      else if (satisfaction >= 3 && satisfaction < 4) satisfactionRanges["3-4"]++
      else if (satisfaction >= 4 && satisfaction <= 5) satisfactionRanges["4-5"]++
    })
    return Object.entries(satisfactionRanges)
      .map(([range, count]) => ({ range, count }))
      .filter((item) => item.count > 0)
  }

  // Calculate distribution for any question field
  const calculateQuestionDistribution = (fieldName) => {
    const distribution = {}
    getFilteredAnalytics().forEach((r) => {
      // Check both direct field and in response_data
      let value = r[fieldName]
      if (!value && r.response_data) {
        try {
          const responseData = typeof r.response_data === "string" ? JSON.parse(r.response_data) : r.response_data
          // Map database field names to response data field names
          const fieldMap = {
            cc_awareness: "ccAwareness",
            cc_visibility: "ccVisibility",
            cc_helpfulness: "ccHelpfulness",
          }
          const mappedField = fieldMap[fieldName] || fieldName
          value = responseData[mappedField] || responseData[fieldName]
        } catch (e) {
          // Ignore parse errors
        }
      }
      value = value || "Not Specified"
      // Format numeric values for CC questions
      if (typeof value === "number") {
        if (fieldName === "cc_awareness") {
          const labels = {
            1: "I know what a CC is and I saw this office's CC",
            2: "I know what a CC is but I did NOT see this office's CC",
            3: "I learned of the CC only when I saw this office's CC",
            4: "I do not know what a CC is",
          }
          value = labels[value] || `Option ${value}`
        } else if (fieldName === "cc_visibility") {
          const labels = {
            1: "In the office",
            2: "In the office website",
            3: "Both in the office and website",
            4: "I did not see the CC",
          }
          value = labels[value] || `Option ${value}`
        } else if (fieldName === "cc_helpfulness") {
          const labels = {
            1: "Very helpful",
            2: "Somewhat helpful",
            3: "Not helpful",
            4: "I did not see the CC",
          }
          value = labels[value] || `Option ${value}`
        }
      }
      distribution[value] = (distribution[value] || 0) + 1
    })
    return Object.entries(distribution)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  }

  const sqdLabels = {
    SQD0: "I am satisfied with the service I availed.",
    SQD1: "I spent a reasonable amount of time for my transaction.",
    SQD2: "The office followed the transaction's requirements and steps.",
    SQD3: "The steps I needed to do for my transaction were easy and simple.",
    SQD4: "I easily found information about my transaction from the office or its website.",
    SQD5: "I paid a reasonable amount of fees for my transaction.",
    SQD6: "I feel the office was fair to everyone during my transaction.",
    SQD7: "I was treated courteously by the staff; staff was helpful if asked.",
    SQD8: "I got what I needed or (if denied) denial was sufficiently explained.",
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  const buildExportRows = () => {
    return getFilteredAnalytics().map((r) => {
      let suggestions = r.suggestions || ""
      let sqdAnswers = {}
      let ccAnswers = {
        ccAwareness: null,
        ccVisibility: null,
        ccHelpfulness: null,
      }

      if (r.response_data) {
        try {
          const parsed = typeof r.response_data === "string" ? JSON.parse(r.response_data) : r.response_data
          suggestions = parsed.suggestions || ""
          sqdAnswers = parsed.sqd_ratings || {}
          ccAnswers = {
            ccAwareness: parsed.ccAwareness ?? r.cc_awareness,
            ccVisibility: parsed.ccVisibility ?? r.cc_visibility,
            ccHelpfulness: parsed.ccHelpfulness ?? r.cc_helpfulness,
          }
        } catch (err) {
          console.error("Error parsing response_data:", err)
        }
      }

      if (!Object.keys(sqdAnswers).length && r.sqd_ratings) {
        try {
          sqdAnswers = typeof r.sqd_ratings === "string" ? JSON.parse(r.sqd_ratings) : r.sqd_ratings
        } catch (err) {
          console.error("Error parsing sqd_ratings:", err)
        }
      }

      if (!ccAnswers.ccAwareness) {
        ccAnswers.ccAwareness = r.cc_awareness
        ccAnswers.ccVisibility = r.cc_visibility
        ccAnswers.ccHelpfulness = r.cc_helpfulness
      }

      const row = {
        date: r.submitted_at || "—",
        name: r.user_name || "Guest",
        email: r.user_email || r.email || "",
        service: r.service || "",
        region: r.region || "",
        clientType: r.client_type || r.clientType || "",
        satisfaction: r.average_satisfaction || "",
        suggestion: suggestions,
        ccAwareness: ccAnswers.ccAwareness || "",
        ccVisibility: ccAnswers.ccVisibility || "",
        ccHelpfulness: ccAnswers.ccHelpfulness || "",
        sqdRatings: sqdAnswers, // Add sqdRatings to the row for ARTA export
        sex: r.sex || "", // Added for ARTA export
      }

      Object.keys(sqdLabels).forEach((key) => {
        const value = sqdAnswers[key]
        let displayValue = ""
        if (value === "NA" || value === "N/A") {
          displayValue = "N/A"
        } else if (typeof value === "number") {
          const ratingLabels = {
            1: "Strongly Disagree",
            2: "Disagree",
            3: "Neither Agree nor Disagree",
            4: "Agree",
            5: "Strongly Agree",
          }
          displayValue = ratingLabels[value] || value
        } else if (value) {
          displayValue = value
        }
        row[key] = displayValue
      })

      return row
    })
  }

  const csvEscape = (value) => {
    const safeValue = (value ?? "").toString().replace(/"/g, '""')
    return `"${safeValue}"`
  }

  const handleExportCSV = async () => {
    if (!canExport()) {
      alert("You don't have permission to export reports")
      return
    }

    const rows = buildExportRows()
    if (!rows.length) return

    const headers = [
      "Date",
      "Name",
      "Email",
      "Service",
      "Region",
      "Client Type",
      "Average Satisfaction",
      "CC1: Awareness of Citizen Charter",
      "CC2: Visibility of Citizen Charter",
      "CC3: Helpfulness of Citizen Charter",
      ...Object.keys(sqdLabels).map((k) => sqdLabels[k]),
      "Suggestions",
    ]

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => {
        const values = [
          row.date,
          row.name,
          row.email,
          row.service,
          row.region,
          row.clientType,
          row.satisfaction,
          row.ccAwareness || "",
          row.ccVisibility || "",
          row.ccHelpfulness || "",
          ...Object.keys(sqdLabels).map((k) => row[k] || ""),
          row.suggestion,
        ]
        return values.map(csvEscape).join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `survey-report-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (user) {
      await logAdminAction(user.email, user.fullName, "Exported survey reports to Excel (CSV)")
    }
  }

  const handleExportExcel = async () => {
    if (!canExport()) {
      alert("You don't have permission to export reports")
      return
    }

    const rows = buildExportRows()
    if (!rows.length) return

    const csv = [
      [
        "Date",
        "Name",
        "Email",
        "Service",
        "Region",
        "Client Type",
        "Average Satisfaction",
        "CC Awareness",
        "CC Visibility",
        "CC Helpfulness",
        "SQD0: Satisfaction with service",
        "SQD1: Reasonable transaction time",
        "SQD2: Office followed requirements",
        "SQD3: Easy transaction steps",
        "SQD4: Easy information access",
        "SQD5: Reasonable fees",
        "SQD6: Fair treatment",
        "SQD7: Courteous staff",
        "SQD8: Got what needed",
        "Suggestions",
      ],
    ]

    rows.forEach((row) => {
      const csvRow = [
        row.date || "",
        row.name || "",
        row.email || "",
        row.service || "",
        row.region || "",
        row.clientType || "",
        row.satisfaction || "",
        row.ccAwareness || "",
        row.ccVisibility || "",
        row.ccHelpfulness || "",
        row.SQD0 || "",
        row.SQD1 || "",
        row.SQD2 || "",
        row.SQD3 || "",
        row.SQD4 || "",
        row.SQD5 || "",
        row.SQD6 || "",
        row.SQD7 || "",
        row.SQD8 || "",
        row.suggestion || "",
      ]
      csv.push(csvRow)
    })

    const csvString = csv.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `survey-export-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    if (user) {
      await logAdminAction(user.email, user.fullName, "Exported survey reports to Excel")
    }
  }

  const handleExportPDF = async () => {
    if (!canExport()) {
      alert("You don't have permission to export reports")
      return
    }

    const rows = buildExportRows()
    if (!rows.length) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    let yPosition = margin

    // Header
    doc.setFontSize(14)
    doc.setFont(undefined, "bold")
    doc.text("Survey Report Export", margin, yPosition)
    doc.setFont(undefined, "normal")
    yPosition += 10

    // Summary
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
    yPosition += 5
    doc.text(`Total Responses: ${rows.length}`, margin, yPosition)
    yPosition += 10

    const tableHeaders = ["Date", "Name", "Service", "Region", "Client Type", "Satisfaction"]

    const colWidth = (pageWidth - 2 * margin) / tableHeaders.length

    let xPosition = margin
    doc.setFillColor(41, 128, 185)
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, "bold")
    doc.setFontSize(8)

    // Table header
    tableHeaders.forEach((header) => {
      doc.rect(xPosition, yPosition, colWidth, 6, "F")
      doc.text(header, xPosition + colWidth / 2, yPosition + 4, { align: "center" })
      xPosition += colWidth
    })

    yPosition += 8
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, "normal")
    doc.setFontSize(7)

    rows.forEach((row) => {
      if (yPosition > pageHeight - 15) {
        doc.addPage()
        yPosition = margin
        // Reprint headers on new page
        let headerX = margin
        doc.setFillColor(41, 128, 185)
        doc.setTextColor(255, 255, 255)
        doc.setFont(undefined, "bold")
        doc.setFontSize(8)
        tableHeaders.forEach((header) => {
          doc.rect(headerX, yPosition, colWidth, 6, "F")
          doc.text(header, headerX + colWidth / 2, yPosition + 4, { align: "center" })
          headerX += colWidth
        })
        yPosition += 8
        doc.setTextColor(0, 0, 0)
        doc.setFont(undefined, "normal")
        doc.setFontSize(7)
      }

      xPosition = margin
      const rowData = [
        row.date ? new Date(row.date).toLocaleDateString() : "—",
        row.name || "—",
        row.service || "—",
        row.region || "—",
        row.clientType || "—",
        row.satisfaction || "—",
      ]

      rowData.forEach((cellText) => {
        const text = cellText.toString().substring(0, 30)
        doc.text(text, xPosition + colWidth / 2, yPosition + 4, {
          maxWidth: colWidth - 2,
          align: "center",
        })
        xPosition += colWidth
      })

      yPosition += 7
    })

    yPosition += 10
    if (yPosition > pageHeight - 20) {
      doc.addPage()
      yPosition = margin
    }

    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("Detailed Survey Responses", margin, yPosition)
    yPosition += 8

    rows.forEach((row, idx) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
      }

      doc.setFontSize(10)
      doc.setFont(undefined, "bold")
      doc.text(`Response #${idx + 1}`, margin, yPosition)
      yPosition += 5

      doc.setFont(undefined, "normal")
      doc.setFontSize(8)

      // Personal info
      doc.text(`Name: ${row.name || "Not provided"}`, margin + 2, yPosition)
      yPosition += 4
      doc.text(`Email: ${row.email || "Not provided"}`, margin + 2, yPosition)
      yPosition += 4
      doc.text(`Service: ${row.service || "Not provided"}`, margin + 2, yPosition)
      yPosition += 4
      doc.text(`Region: ${row.region || "Not provided"}`, margin + 2, yPosition)
      yPosition += 4
      doc.text(`Client Type: ${row.clientType || "Not provided"}`, margin + 2, yPosition)
      yPosition += 5

      // CC Questions
      doc.setFont(undefined, "bold")
      doc.text("Citizen's Charter Responses:", margin + 2, yPosition)
      yPosition += 4
      doc.setFont(undefined, "normal")
      doc.text(`CC Awareness: ${row.ccAwareness || "Not answered"}`, margin + 4, yPosition)
      yPosition += 4
      doc.text(`CC Visibility: ${row.ccVisibility || "Not answered"}`, margin + 4, yPosition)
      yPosition += 4
      doc.text(`CC Helpfulness: ${row.ccHelpfulness || "Not answered"}`, margin + 4, yPosition)
      yPosition += 5

      // SQD Ratings
      doc.setFont(undefined, "bold")
      doc.text("Service Quality Ratings:", margin + 2, yPosition)
      yPosition += 4
      doc.setFont(undefined, "normal")

      Object.keys(sqdLabels).forEach((key) => {
        if (yPosition > pageHeight - 10) {
          doc.addPage()
          yPosition = margin
        }
        const answer = row[key] || "Not Answered"
        const wrappedText = doc.splitTextToSize(`${key}: ${answer}`, pageWidth - margin * 2 - 6)
        wrappedText.forEach((line) => {
          doc.text(line, margin + 4, yPosition)
          yPosition += 3.5
        })
      })

      yPosition += 3

      // Suggestions
      if (row.suggestion) {
        if (yPosition > pageHeight - 15) {
          doc.addPage()
          yPosition = margin
        }
        doc.setFont(undefined, "bold")
        doc.text("Suggestions:", margin + 2, yPosition)
        yPosition += 4
        doc.setFont(undefined, "normal")
        const wrappedSuggestion = doc.splitTextToSize(row.suggestion, pageWidth - margin * 2 - 6)
        wrappedSuggestion.forEach((line) => {
          if (yPosition > pageHeight - 10) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin + 4, yPosition)
          yPosition += 3.5
        })
      }

      yPosition += 5
    })

    doc.save(`survey-report-${Date.now()}.pdf`)

    if (user) {
      await logAdminAction(user.email, user.fullName, "Exported survey reports to PDF")
    }
  }

  const handleExportARTA = async () => {
    if (!canExport()) {
      alert("You don't have permission to export reports")
      return
    }

    const rows = buildExportRows()
    if (!rows.length) return

    const doc = new jsPDF("p", "mm", "letter")
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    let yPosition = margin

    rows.forEach((response, pageNum) => {
      if (pageNum > 0) {
        doc.addPage()
        yPosition = margin
      }

      // Header
      doc.setFontSize(8)
      doc.setFont(undefined, "normal")
      doc.text("Control No.: ___", margin, yPosition)
      doc.text("(On-Site Version)", pageWidth - margin - 15, yPosition, { align: "right" })
      yPosition += 6

      // Main header
      doc.setFontSize(10)
      doc.setFont(undefined, "bold")
      doc.text("CITY GOVERNMENT OF VALENZUELA", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 4
      doc.text("HELP US SERVE YOU BETTER!", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 5

      // Description paragraph
      doc.setFontSize(8)
      doc.setFont(undefined, "normal")
      const descText =
        "This Client Satisfaction Measurement (CSM) tracks the customer experience of government offices. Your feedback be kept confidential and will help us improve and deliver better public service. Personally identifiable information shared will be in accordance with Republic Act 10173 (Data Privacy Act). You have the option to not answer this form."
      const wrappedDesc = doc.splitTextToSize(descText, pageWidth - 2 * margin)
      wrappedDesc.forEach((line) => {
        doc.text(line, margin, yPosition)
        yPosition += 2.5
      })
      yPosition += 3

      doc.setFont(undefined, "bold")
      doc.setFontSize(8)

      // Row 1: Client Type and Sex
      doc.text("Client type:", margin, yPosition)
      doc.setFont(undefined, "normal")
      const clientTypeValue = response.clientType || ""
      const clientTypeDisplay =
        clientTypeValue === "citizen"
          ? "Citizen"
          : clientTypeValue === "business"
            ? "Business"
            : clientTypeValue === "government"
              ? "Government (Employees)"
              : "N/A"

      doc.text(clientTypeDisplay, margin + 20, yPosition)

      doc.setFont(undefined, "bold")
      doc.text("Sex:", pageWidth / 2 + 30, yPosition)
      doc.setFont(undefined, "normal")
      const sexValue = response.sex || ""
      const sexDisplay = sexValue === "male" ? "Male" : sexValue === "female" ? "Female" : "N/A"
      doc.text(sexDisplay, pageWidth / 2 + 38, yPosition)
      yPosition += 5

      // Row 2: Date and Service
      doc.setFont(undefined, "bold")
      doc.text("Date:", margin, yPosition)
      doc.setFont(undefined, "normal")
      doc.text(response.date || "_______________", margin + 12, yPosition)

      doc.setFont(undefined, "bold")
      doc.text("Service Availed:", pageWidth / 2, yPosition)
      doc.setFont(undefined, "normal")
      const serviceText = response.service || "_______________"
      doc.text(serviceText.substring(0, 30), pageWidth / 2 + 25, yPosition)
      yPosition += 5

      // Row 3: Region
      doc.setFont(undefined, "bold")
      doc.text("Region of residence:", margin, yPosition)
      doc.setFont(undefined, "normal")
      doc.text(response.region || "_______________", margin + 35, yPosition)
      yPosition += 6

      // CC Section header
      doc.setFont(undefined, "bold")
      doc.setFontSize(9)
      doc.text("CITIZEN'S CHARTER (CC) QUESTIONS:", margin, yPosition)
      yPosition += 3

      doc.setFont(undefined, "normal")
      doc.setFontSize(7.5)
      const ccInstructions =
        "Please indicate your awareness and understanding of the Citizen's Charter by placing a check mark in the appropriate boxes."
      const wrappedCC = doc.splitTextToSize(ccInstructions, pageWidth - 2 * margin)
      wrappedCC.forEach((line) => {
        doc.text(line, margin, yPosition)
        yPosition += 2
      })
      yPosition += 3

      const ccQuestions = [
        { key: "ccAwareness", label: "CC1: Which of the following best describes your awareness of a CC?" },
        { key: "ccVisibility", label: "CC2: If aware of CC, would you say the CC of this office was easy to see?" },
        { key: "ccHelpfulness", label: "CC3: If aware of CC, how much did the CC help you?" },
      ]

      doc.setFontSize(7.5)
      ccQuestions.forEach((question) => {
        doc.setFont(undefined, "bold")
        const wrappedQuestion = doc.splitTextToSize(question.label, pageWidth - 2 * margin - 5)
        wrappedQuestion.forEach((line) => {
          doc.text(line, margin, yPosition)
          yPosition += 2.5
        })

        doc.setFont(undefined, "normal")
        const answer = response[question.key] || "Not answered"
        doc.text(`Answer: ${answer}`, margin + 5, yPosition)
        yPosition += 4
      })

      yPosition += 3

      const sqdData = response.sqdRatings || {}
      const sqdQuestions = [
        { key: "SQD0", label: "I am satisfied with the service I availed." },
        { key: "SQD1", label: "I spent a reasonable amount of time for my transaction." },
        { key: "SQD2", label: "The office followed the transaction's requirements and steps." },
        { key: "SQD3", label: "The steps I needed to do for my transaction were easy and simple." },
        { key: "SQD4", label: "I easily found information about my transaction." },
        { key: "SQD5", label: "I paid a reasonable amount of fees for my transaction." },
        { key: "SQD6", label: "I feel the office was fair to everyone during my transaction." },
        { key: "SQD7", label: "I was treated courteously by the staff; staff was helpful if asked." },
        { key: "SQD8", label: "I got what I needed or (if denied) denial was sufficiently explained." },
      ]

      doc.setFont(undefined, "bold")
      doc.setFontSize(8)
      doc.text("SERVICE QUALITY DIMENSIONS (SQD) RATINGS:", margin, yPosition)
      yPosition += 3

      doc.setFont(undefined, "normal")
      doc.setFontSize(7)
      doc.text(
        "Instructions: Please place a check mark in the column that best corresponds to your answer.",
        margin,
        yPosition,
      )
      yPosition += 4

      // Table header with clear labels
      const headerY = yPosition
      const colWidth = 16
      let colX = margin

      doc.setFont(undefined, "bold")
      doc.setFontSize(7.5)
      doc.setFillColor(25, 118, 210)
      doc.setTextColor(255, 255, 255)
      doc.rect(margin, headerY - 2.5, pageWidth - 2 * margin, 4, "F")

      doc.text("Questions", colX, headerY)
      colX += 90

      const ratingHeaders = ["SD", "D", "N", "A", "SA", "N/A"]

      ratingHeaders.forEach((header) => {
        doc.text(header, colX + colWidth / 2 - 1, headerY, { align: "center" })
        colX += colWidth
      })
      yPosition += 5

      // Table rows
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, "normal")
      doc.setFontSize(7)
      let rowNum = 0

      sqdQuestions.forEach((question) => {
        // Alternating row background
        if (rowNum % 2 === 1) {
          doc.setFillColor(240, 248, 255)
          doc.rect(margin, yPosition - 2.5, pageWidth - 2 * margin, 4.5, "F")
        }

        // Question text (wrapped)
        const qText = question.label
        const wrappedQ = doc.splitTextToSize(qText, 87)
        wrappedQ.forEach((line, idx) => {
          doc.text(line, margin + 1, yPosition + idx * 2)
        })
        const questionHeight = wrappedQ.length * 2

        // Rating boxes with checkmarks
        let ratingX = margin + 90
        const answer = sqdData[question.key]

        ratingHeaders.forEach((header) => {
          // Box border
          doc.setDrawColor(180, 180, 180)
          doc.rect(ratingX, yPosition - 2, colWidth - 1, 4)

          // Display checkmark for selected rating
          let displayChar = " "
          if (answer) {
            const answerMap = {
              1: "SD",
              2: "D",
              3: "N",
              4: "A",
              5: "SA",
              NA: "N/A",
            }
            const answerShort = answerMap[answer] || String(answer)
            if (answerShort === header) {
              displayChar = "/"
              doc.setFont(undefined, "bold")
              doc.setFontSize(9)
            }
          }

          doc.text(displayChar, ratingX + colWidth / 2 - 1, yPosition + 1, {
            align: "center",
          })
          doc.setFont(undefined, "normal")
          doc.setFontSize(7)
          ratingX += colWidth
        })

        yPosition += Math.max(questionHeight, 4) + 0.5
        rowNum++
      })

      yPosition += 4
      doc.setFont(undefined, "bold")
      doc.setFontSize(8)
      doc.text("FEEDBACK & SUGGESTIONS:", margin, yPosition)
      yPosition += 3

      doc.setFont(undefined, "normal")
      doc.setFontSize(7.5)
      doc.text("Suggestions for improvement (optional):", margin, yPosition)
      yPosition += 2.5

      const suggestionsText = response.suggestion || "[No suggestions provided]"
      const wrappedSugg = doc.splitTextToSize(suggestionsText, pageWidth - 2 * margin - 3)
      wrappedSugg.slice(0, 3).forEach((line) => {
        doc.text(line, margin + 2, yPosition)
        yPosition += 2
      })

      yPosition += 2
      doc.text("Email (optional):", margin, yPosition)
      yPosition += 2
      doc.text(response.email || "[Not provided]", margin + 2, yPosition)

      yPosition += 5
      doc.setFont(undefined, "bold")
      doc.setFontSize(10)
      doc.text("THANK YOU!", pageWidth / 2, yPosition, { align: "center" })
    })

    doc.save(`ARTA-survey-export-${Date.now()}.pdf`)

    if (user) {
      await logAdminAction(user.email, user.fullName, "Exported survey reports to ARTA PDF")
    }
  }

  const filteredResponses = getFilteredAnalytics()

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-10 text-center">Loading...</main>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Survey Reports & Analytics</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Responses</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{filteredResponses.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Average Satisfaction (0-5)</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {filteredResponses.length > 0
                ? (
                    filteredResponses.reduce((sum, r) => sum + Number.parseFloat(r.average_satisfaction || 0), 0) /
                    filteredResponses.length
                  ).toFixed(2)
                : "—"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Respondents</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{filteredResponses.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-sm">Service Type</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm">Region</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Regions</option>
                {analytics?.byRegion
                  ?.map((r) => r.region)
                  .sort((a, b) => a.localeCompare(b))
                  .map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm">Date From</label>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm">Date To</label>
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleExportCSV}
              disabled={!filteredResponses.length || !canExport()}
              className={`px-5 py-2 rounded font-semibold transition ${
                filteredResponses.length && canExport()
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Export to Excel (CSV)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!filteredResponses.length || !canExport()}
              className={`px-5 py-2 rounded font-semibold transition ${
                filteredResponses.length && canExport()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Export to PDF
            </button>
            <button
              onClick={handleExportARTA}
              disabled={!filteredResponses.length || !canExport()}
              className={`px-5 py-2 rounded font-semibold transition ${
                filteredResponses.length && canExport()
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Export to ARTA format
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Total Satisfaction Distribution */}
          {calculateSatisfactionDistribution().length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Total Satisfaction Distribution (0-5 Scale)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateSatisfactionDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F">
                    {calculateSatisfactionDistribution().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gender Distribution - Replace "na" with "N/A" */}
          {analytics?.byGender && analytics.byGender.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.byGender.map((item) => ({
                    ...item,
                    gender: item.gender === "na" ? "N/A" : item.gender,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gender" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {analytics.byGender.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Client Type Distribution */}
          {analytics?.byClientType && analytics.byClientType.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Client Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.byClientType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="client_type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d">
                    {analytics.byClientType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Region Distribution */}
          {analytics?.byRegion && analytics.byRegion.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Region Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.byRegion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658">
                    {analytics.byRegion.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* All SDQS Questions Combined */}
          {calculateSQDDistribution().length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">All Survey Quality Dimensions (SDQS) - Combined</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateSQDDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {calculateSQDDistribution().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Service Type Distribution */}
          {calculateQuestionDistribution("service").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Service Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("service")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8042">
                    {calculateQuestionDistribution("service").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Age Distribution */}
          {calculateQuestionDistribution("age").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Age Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("age")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884D8">
                    {calculateQuestionDistribution("age").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Citizen's Charter Awareness */}
          {calculateQuestionDistribution("cc_awareness").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Citizen's Charter Awareness</h3>
              <p className="text-sm text-gray-600 mb-4">Which best describes your awareness of a Citizen's Charter?</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("cc_awareness")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F">
                    {calculateQuestionDistribution("cc_awareness").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Citizen's Charter Visibility */}
          {calculateQuestionDistribution("cc_visibility").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Citizen's Charter Visibility</h3>
              <p className="text-sm text-gray-600 mb-4">Where did you see the Citizen's Charter?</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("cc_visibility")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FFBB28">
                    {calculateQuestionDistribution("cc_visibility").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Citizen's Charter Helpfulness */}
          {calculateQuestionDistribution("cc_helpfulness").length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Citizen's Charter Helpfulness</h3>
              <p className="text-sm text-gray-600 mb-4">How helpful was the Citizen's Charter in your transaction?</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculateQuestionDistribution("cc_helpfulness")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8042">
                    {calculateQuestionDistribution("cc_helpfulness").map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Individual SQD Dimensions 0-8 */}
          {["SQD0", "SQD1", "SQD2", "SQD3", "SQD4", "SQD5", "SQD6", "SQD7", "SQD8"].map((dimension) => {
            const data = calculateSQDDimension(dimension)
            if (data.length === 0) return null
            return (
              <div key={dimension} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-2">
                  SQD {dimension.slice(-1)}: {sqdLabels[dimension]}
                </h3>
                <p className="text-sm text-gray-600 mb-4">Rating Distribution (0-8 scale)</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
