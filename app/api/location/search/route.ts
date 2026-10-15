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
    countryCode?: string;
    countryCodeISO3?: string;
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

    const base = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`;
    const params = new URLSearchParams({ key: apiKey, limit: "8", typeahead: "true", language: "ar" });
    const search = (url: string) => fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
    });
    let response = await search(`${base}?${params.toString()}`);
    // Some TomTom plans reject regional language tags; retry without language on a 400.
    if (response.status === 400) {
      params.delete("language");
      response = await search(`${base}?${params.toString()}`);
    }
    if (!response.ok) {
      console.error("TomTom destination search failed", { status: response.status });
      return NextResponse.json(
        { error: response.status === 429 ? "SEARCH_RATE_LIMITED" : "DESTINATION_SEARCH_UNAVAILABLE" },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const data = (await response.json()) as TomTomGeocodeResponse;
    const results = (data.results ?? []).filter((item) =>
      Number.isFinite(item.position?.lat) && Number.isFinite(item.position?.lon)
    );
    if (!results.length) {
      return NextResponse.json({ suggestions: [], error: "Destination not found" }, { status: 200 });
    }
    const suggestions = results.map((result) => {
      const name = result.poi?.name || result.address?.municipalitySubdivision || result.address?.municipality || result.address?.freeformAddress || query;
      return {
        name,
        address: result.address?.freeformAddress ?? name,
        city: result.address?.municipality ?? result.address?.municipalitySubdivision ?? "",
        country: result.address?.country ?? "",
        countryCode: result.address?.countryCode ?? result.address?.countryCodeISO3 ?? "",
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
