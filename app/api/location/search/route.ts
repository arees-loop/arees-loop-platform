import { NextRequest, NextResponse } from "next/server";

type TomTomGeocodeResult = {
  position?: {
    lat?: number;
    lon?: number;
  };
  address?: {
    freeformAddress?: string;
    municipality?: string;
    municipalitySubdivision?: string;
    countrySubdivision?: string;
    country?: string;
  };
};

type TomTomGeocodeResponse = {
  results?: TomTomGeocodeResult[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Destination query is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.TOMTOM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "TomTom API key is not configured" },
        { status: 500 }
      );
    }

    const url =
      `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(query)}.json` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&language=ar-SA` +
      `&countrySet=SA` +
      `&limit=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "TomTom destination search error:",
        response.status,
        await response.text()
      );

      return NextResponse.json(
        { error: "Failed to search destination" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as TomTomGeocodeResponse;
    const result = data.results?.[0];
    const lat = result?.position?.lat;
    const lng = result?.position?.lon;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    const name =
      result?.address?.municipality ||
      result?.address?.municipalitySubdivision ||
      result?.address?.freeformAddress ||
      query;

    return NextResponse.json({
      name,
      address: result?.address?.freeformAddress ?? name,
      location: { lat, lng },
    });
  } catch (error) {
    console.error("Destination search error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
