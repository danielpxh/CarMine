import { NextResponse } from "next/server";

type AutoListing = {
  vin?: string;
  vehicle?: {
    vin?: string;
    make?: string;
    model?: string;
    year?: number;
    trim?: string;
  };
  retailListing?: {
    price?: number;
    miles?: number;
    primaryImage?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

function normalizeListing(listing: AutoListing) {
  const vehicle = listing.vehicle;
  const retailListing = listing.retailListing;

  return {
    id: vehicle?.vin ?? listing.vin ?? "",
    make: vehicle?.make ?? "",
    model: vehicle?.model ?? "",
    year: vehicle?.year ?? 0,
    trim: vehicle?.trim ?? "",
    price: retailListing?.price ?? 0,
    mileage: retailListing?.miles ?? 0,
    primaryPhotoUrl: retailListing?.primaryImage ?? "",
    listed_date: listing.createdAt ?? listing.updatedAt ?? "",
  };
}

export async function GET(request: Request) {
  const apiKey = process.env.AUTO_DEV_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Auto.dev is not configured. Set AUTO_DEV_API_KEY on the server.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 30);
  const sort = searchParams.get("sort") ?? "newest";
  const make = searchParams.get("make")?.trim();

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return NextResponse.json(
      { error: "Page must be a positive integer and limit must be between 1 and 100." },
      { status: 400 }
    );
  }

  const sortBy =
    sort === "oldest"
      ? "createdAt.asc"
      : sort === "price_high"
        ? "price.desc"
        : sort === "price_low"
          ? "price.asc"
          : "createdAt.desc";
  const apiUrl = new URL("https://api.auto.dev/listings");
  apiUrl.searchParams.set("page", String(page));
  apiUrl.searchParams.set("limit", String(limit));
  apiUrl.searchParams.set("sort", sortBy);
  if (make) apiUrl.searchParams.set("vehicle.make", make);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(
        `Auto.dev listings request failed with status ${response.status}`
      );
      return NextResponse.json(
        { error: "Unable to load vehicle listings from Auto.dev." },
        { status: response.status }
      );
    }

    const data: { data?: AutoListing[]; links?: { next?: string | null } } =
      await response.json();
    return NextResponse.json({
      records: (data.data ?? []).map(normalizeListing),
      hasMore: Boolean(data.links?.next),
    });
  } catch (error) {
    console.error("Auto.dev listings request failed:", error);
    return NextResponse.json(
      { error: "Unable to load vehicle listings from Auto.dev." },
      { status: 502 }
    );
  }
}
