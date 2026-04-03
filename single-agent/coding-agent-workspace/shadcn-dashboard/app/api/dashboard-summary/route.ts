import { NextResponse } from "next/server"

import data from "@/app/dashboard/data.json"

const sectionCardMetrics = [
  {
    label: "Total Revenue",
    value: "$1,250.00",
    trend: "+12.5%",
    note: "Trending up this month. Visitors for the last 6 months.",
  },
  {
    label: "New Customers",
    value: "1,234",
    trend: "-20%",
    note: "Down 20% this period. Acquisition needs attention.",
  },
  {
    label: "Active Accounts",
    value: "45,678",
    trend: "+12.5%",
    note: "Strong user retention. Engagement exceeds targets.",
  },
  {
    label: "Growth Rate",
    value: "4.5%",
    trend: "+4.5%",
    note: "Steady performance increase. Meets growth projections.",
  },
] as const

export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "OPENAI_API_KEY is not configured.",
      },
      { status: 500 }
    )
  }

  try {
    const totalItems = data.length
    const doneItems = data.filter((item) => item.status === "Done").length
    const inProcessItems = data.filter(
      (item) => item.status === "In Process"
    ).length
    const blockedItems = data.filter((item) => item.status === "Blocked").length
    const unassignedReviewers = data.filter(
      (item) => item.reviewer === "Assign reviewer"
    ).length

    const itemsOverLimit = data.filter((item) => {
      const target = Number(item.target)
      const limit = Number(item.limit)

      return Number.isFinite(target) && Number.isFinite(limit) && target > limit
    }).length

    const itemsAtOrBelowLimit = data.filter((item) => {
      const target = Number(item.target)
      const limit = Number(item.limit)

      return Number.isFinite(target) && Number.isFinite(limit) && target <= limit
    }).length

    const typeBreakdown = Object.entries(
      data.reduce<Record<string, number>>((acc, item) => {
        acc[item.type] = (acc[item.type] ?? 0) + 1
        return acc
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `${type}: ${count}`)

    const dashboardMetrics = {
      totalItems,
      doneItems,
      inProcessItems,
      blockedItems,
      unassignedReviewers,
      itemsOverLimit,
      itemsAtOrBelowLimit,
      typeBreakdown,
      sectionCardMetrics,
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        instructions:
          "You summarize dashboard metrics for an executive audience. Be concise, specific, and mention the main strengths, risks, and next actions in 3 short paragraphs.",
        input: `Summarize this dashboard data:\n${JSON.stringify(
          dashboardMetrics,
          null,
          2
        )}`,
      }),
    })

    const payload = (await response.json()) as {
      error?: { message?: string }
      output?: Array<{
        type?: string
        content?: Array<{
          type?: string
          text?: string
        }>
      }>
      output_text?: string
    }

    if (!response.ok) {
      throw new Error(
        payload.error?.message || "Failed to generate dashboard summary."
      )
    }

    const summary =
      payload.output_text ||
      payload.output
        ?.flatMap((item) => item.content ?? [])
        .filter((item) => item.type === "output_text")
        .map((item) => item.text ?? "")
        .join("")
        .trim() ||
      "No summary available."

    return NextResponse.json({
      summary,
    })
  } catch (error) {
    console.error("Dashboard summary generation failed:", error)

    return NextResponse.json(
      {
        error: "Failed to generate dashboard summary.",
      },
      { status: 500 }
    )
  }
}
