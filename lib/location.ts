export type AreesCoordinates = {
  lat: number;
  lng: number;
  accuracy: number | null;
};

export type AreesLocation = {
  coordinates: AreesCoordinates;
  address: string | null;
  placeId: string | null;
};

export type LocationErrorCode =
  | "NOT_SUPPORTED"
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "REVERSE_GEOCODING_FAILED"
  | "UNKNOWN";

export class AreesLocationError extends Error {
  code: LocationErrorCode;

  constructor(code: LocationErrorCode, message: string) {
    super(message);
    this.name = "AreesLocationError";
    this.code = code;
  }
}

type ReverseGeocodeResponse = {
  address?: string;
  placeId?: string | null;
  location?: {
    lat: number;
    lng: number;
  };
  error?: string;
};

const DEFAULT_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60 * 1000,
};

function getBrowserCoordinates(
  options: PositionOptions = DEFAULT_GEOLOCATION_OPTIONS,
): Promise<AreesCoordinates> {
  return new Promise((resolve, reject) => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !("geolocation" in navigator)
    ) {
      reject(
        new AreesLocationError(
          "NOT_SUPPORTED",
          "Geolocation is not supported on this device.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new AreesLocationError(
                "PERMISSION_DENIED",
                "Location permission was denied.",
              ),
            );
            return;

          case error.POSITION_UNAVAILABLE:
            reject(
              new AreesLocationError(
                "POSITION_UNAVAILABLE",
                "Current location is unavailable.",
              ),
            );
            return;

          case error.TIMEOUT:
            reject(
              new AreesLocationError(
                "TIMEOUT",
                "Location request timed out.",
              ),
            );
            return;

          default:
            reject(
              new AreesLocationError(
                "UNKNOWN",
                "Unable to determine the current location.",
              ),
            );
        }
      },
      options,
    );
  });
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{
  address: string | null;
  placeId: string | null;
}> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });

  const response = await fetch(
    `/api/location/reverse-geocode?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  let data: ReverseGeocodeResponse | null = null;

  try {
    data = (await response.json()) as ReverseGeocodeResponse;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new AreesLocationError(
      "REVERSE_GEOCODING_FAILED",
      data?.error || "Reverse geocoding failed.",
    );
  }

  return {
    address: data?.address ?? null,
    placeId: data?.placeId ?? null,
  };
}

export async function getCurrentLocation(
  options?: PositionOptions,
): Promise<AreesLocation> {
  const coordinates = await getBrowserCoordinates(
    options ?? DEFAULT_GEOLOCATION_OPTIONS,
  );

  try {
    const result = await reverseGeocode(
      coordinates.lat,
      coordinates.lng,
    );

    return {
      coordinates,
      address: result.address,
      placeId: result.placeId,
    };
  } catch (error) {
    console.error("Arees Loop reverse geocoding failed:", error);

    return {
      coordinates,
      address: null,
      placeId: null,
    };
  }
}