import { NextRequest, NextResponse } from "next/server";

type TomTomGeocodeResult = {
  poi?: { name?: string };
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
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&language=ar-SA` +
      `&countrySet=SA` +
      `&limit=8` +
      `&typeahead=true`;

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
    const results = (data.results ?? []).filter((item) =>
      Number.isFinite(item.position?.lat) && Number.isFinite(item.position?.lon)
    );
    if (!results.length) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }
    const suggestions = results.map((result) => {
      const name = result.poi?.name || result.address?.municipalitySubdivision || result.address?.municipality || result.address?.freeformAddress || query;
      return {
        name,
        address: result.address?.freeformAddress ?? name,
        city: result.address?.municipality ?? "",
        location: { lat: result.position!.lat!, lng: result.position!.lon! },
      };
    });
    return NextResponse.json({ ...suggestions[0], suggestions });
  } catch (error) {
    console.error("Destination search error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
