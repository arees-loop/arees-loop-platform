import { NextRequest, NextResponse } from "next/server";

type TomTomReverseGeocodeResult = {
  id?: string;
  title?: string;
  address?: {
    freeformAddress?: string;
    formattedAddress?: string;
  };
};

type TomTomReverseGeocodeResponse = {
  results?: TomTomReverseGeocodeResult[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
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

    // TomTom Orbis expects position as: longitude,latitude
    const position = `${longitude},${latitude}`;

    const url =
      `https://api.tomtom.com/maps/orbis/places/reverseGeocode` +
      `?position=${encodeURIComponent(position)}` +
      `&radiusInMeters=100`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "TomTom-Api-Key": apiKey,
        "TomTom-Api-Version": "2",
        Attributes: "results",
        "Accept-Language": "ar-SA",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "TomTom Reverse Geocoding API error:",
        response.status,
        errorText
      );

      return NextResponse.json(
        {
          error: "Failed to contact TomTom Reverse Geocoding API",
          tomtomStatus: response.status,
        },
        { status: 502 }
      );
    }

    const data =
      (await response.json()) as TomTomReverseGeocodeResponse;

    if (!data.results?.length) {
      return NextResponse.json(
        {
          error: "No address found",
          tomtomStatus: "NO_RESULTS",
        },
        { status: 404 }
      );
    }

    const result = data.results[0];

    const address =
      result.address?.freeformAddress ||
      result.address?.formattedAddress ||
      result.title ||
      null;

    if (!address) {
      return NextResponse.json(
        {
          error: "No address found",
          tomtomStatus: "ADDRESS_MISSING",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address,
      placeId: result.id ?? null,
      location: {
        lat: latitude,
        lng: longitude,
      },
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}