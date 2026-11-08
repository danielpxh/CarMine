import { NextResponse } from "next/server";

type AutoListing = {
  data?: {
    vin?: string;
    vehicle?: {
      vin?: string;
      year?: number;
      make?: string;
      model?: string;
      trim?: string;
      fuel?: string;
      transmission?: string;
      engine?: string;
    };
    retailListing?: {
      price?: number;
      miles?: number;
      primaryImage?: string;
      photoCount?: number;
      city?: string;
      state?: string;
      dealer?: string;
      used?: boolean;
      exteriorColor?: string;
      interiorColor?: string;
      photos?: string[];
    };
  };
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params;
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(id)) {
    return NextResponse.json(
      { error: "Invalid vehicle identifier." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.auto.dev/listings/${encodeURIComponent(id)}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error(
        `Auto.dev listing request failed with status ${response.status}`
      );
      return NextResponse.json(
        { error: "Unable to load this vehicle from Auto.dev." },
        { status: response.status }
      );
    }

    const listing: AutoListing = await response.json();
    const vehicle = listing.data?.vehicle;
    const retailListing = listing.data?.retailListing;
    if (!vehicle || !retailListing) {
      return NextResponse.json(
        { error: "Vehicle listing was not found." },
        { status: 404 }
      );
    }

    const name = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
      .filter(Boolean)
      .join(" ");
    const location = [retailListing.city, retailListing.state]
      .filter(Boolean)
      .join(", ");

    return NextResponse.json({
      id: vehicle.vin ?? listing.data?.vin ?? id,
      make: vehicle.make ?? "",
      model: vehicle.model ?? "",
      year: vehicle.year ?? 0,
      trim: vehicle.trim ?? "",
      price: retailListing.price ?? 0,
      mileage: retailListing.miles ?? 0,
      image_url:
        retailListing.primaryImage ||
        "https://placehold.co/800x600/e7e5e4/44403c?text=Vehicle+photo+unavailable",
      location: location || "Location not listed",
      exteriorColor: retailListing.exteriorColor ?? "Not specified",
      interiorColor: retailListing.interiorColor ?? "Not specified",
      fuelType: vehicle.fuel ?? "Not specified",
      transmission: vehicle.transmission ?? "Not specified",
      engine: vehicle.engine ?? "Not specified",
      vin: vehicle.vin ?? listing.data?.vin ?? id,
      description: `${name}${location ? `, located in ${location}` : ""}.`,
      photoUrls: retailListing.primaryImage ? [retailListing.primaryImage] : [],
      condition: retailListing.used ? "Used" : "New",
    });
  } catch (error) {
    console.error("Auto.dev vehicle request failed:", error);
    return NextResponse.json(
      { error: "Unable to load this vehicle from Auto.dev." },
      { status: 502 }
    );
  }
}
