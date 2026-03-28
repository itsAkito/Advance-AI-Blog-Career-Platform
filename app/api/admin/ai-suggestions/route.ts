import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const suggestions = [
      {
        id: "1",
        name: "Ethical AI Reviewer",
        description: "Review AI ethics and compliance",
        priority: "High" as const,
      },
      {
        id: "2",
        name: "Sustainability Auditor",
        description: "Audit sustainability practices",
        priority: "Medium" as const,
      },
      {
        id: "3",
        name: "Prompt Architect",
        description: "Design and optimize prompts",
        priority: "Low" as const,
      },
    ];

    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch AI suggestions" },
      { status: 500 }
    );
  }
}
