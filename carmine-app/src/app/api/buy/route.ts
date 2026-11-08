import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_BASE_API_URL is not configured." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(new URL("/api/buy", apiBaseUrl), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error(`Backend GET /api/buy returned HTTP ${response.status}.`);
      return NextResponse.json(
        { error: `Car inventory service returned HTTP ${response.status}.` },
        { status: 502 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(
      "Backend GET /api/buy is unavailable:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error:
          "Car inventory service is unavailable. Start the backend and verify NEXT_PUBLIC_BASE_API_URL.",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_BASE_API_URL is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(new URL("/api/buy", apiBaseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Backend POST /api/buy is unavailable:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error:
          "Car inventory service is unavailable. Start the backend and verify NEXT_PUBLIC_BASE_API_URL.",
      },
      { status: 502 }
    );
  }
}
