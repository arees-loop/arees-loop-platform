"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

type SelectedLocation = {
  lat: number;
  lng: number;
  placeName: string;
  address: string;
  placeId: string;
};

export default function MapTestPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [status, setStatus] = useState("جاري تحميل Google Maps...");

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setStatus("مفتاح Google Maps غير موجود في .env.local");
      return;
    }

    let destroyed = false;

    async function initMap() {
      if (
        destroyed ||
        !mapRef.current ||
        !autocompleteContainerRef.current ||
        !window.google?.maps
      ) {
        return;
      }

      try {
        /*
         * تحميل المكتبات بالطريقة الحديثة
         */
        await window.google.maps.importLibrary("maps");

        const placesLibrary =
          await window.google.maps.importLibrary("places");

        const { PlaceAutocompleteElement } = placesLibrary;

        const madinah = {
          lat: 24.4672,
          lng: 39.6111,
        };

        /*
         * إنشاء الخريطة
         */
        const map = new window.google.maps.Map(mapRef.current, {
          center: madinah,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
        });

        mapInstanceRef.current = map;

        /*
         * Marker
         */
        const marker = new window.google.maps.Marker({
          map,
          position: madinah,
          draggable: true,
          title: "الموقع المختار",
        });

        markerRef.current = marker;

        setSelectedLocation({
          lat: madinah.lat,
          lng: madinah.lng,
          placeName: "المدينة المنورة",
          address: "المدينة المنورة، المملكة العربية السعودية",
          placeId: "",
        });

        /*
         * ==================================================
         * Places Autocomplete الجديد
         * ==================================================
         */

        const placeAutocomplete = new PlaceAutocompleteElement();

        placeAutocomplete.placeholder =
          "ابحث باسم المتحف، المطعم، الفندق أو الوجهة...";

        /*
         * تفضيل نتائج السعودية
         */
        try {
          placeAutocomplete.includedRegionCodes = ["sa"];
        } catch (error) {
          console.log("Region restriction not applied:", error);
        }

        /*
         * تفريغ الحاوية أولاً لمنع التكرار
         */
        autocompleteContainerRef.current.innerHTML = "";

        autocompleteContainerRef.current.appendChild(
          placeAutocomplete
        );

        /*
         * عند اختيار نتيجة
         */
        placeAutocomplete.addEventListener(
          "gmp-select",
          async (event: any) => {
            try {
              setStatus("جاري تحميل بيانات المكان...");

              const placePrediction = event.placePrediction;

              if (!placePrediction) {
                setStatus("لم يتم استلام بيانات المكان");
                return;
              }

              const place = placePrediction.toPlace();

              await place.fetchFields({
                fields: [
                  "id",
                  "displayName",
                  "formattedAddress",
                  "location",
                  "viewport",
                ],
              });

              if (!place.location) {
                setStatus("تعذر تحديد موقع المكان المختار");
                return;
              }

              const lat = place.location.lat();
              const lng = place.location.lng();

              /*
               * تحريك الخريطة
               */
              if (place.viewport) {
                map.fitBounds(place.viewport);
              } else {
                map.setCenter({
                  lat,
                  lng,
                });

                map.setZoom(17);
              }

              /*
               * تحريك Marker
               */
              marker.setPosition({
                lat,
                lng,
              });

              /*
               * حفظ البيانات
               */
              setSelectedLocation({
                lat,
                lng,
                placeName:
                  place.displayName || "مكان بدون اسم",

                address:
                  place.formattedAddress || "العنوان غير متوفر",

                placeId: place.id || "",
              });

              setStatus("تم اختيار المكان من Google Places بنجاح");
            } catch (error) {
              console.error("Place selection error:", error);

              setStatus("حدث خطأ أثناء تحميل بيانات المكان");
            }
          }
        );

        /*
         * ==================================================
         * الضغط على الخريطة
         * ==================================================
         */

        map.addListener("click", (event: any) => {
          if (!event.latLng) return;

          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          marker.setPosition({
            lat,
            lng,
          });

          setSelectedLocation({
            lat,
            lng,
            placeName: "موقع محدد يدويًا",
            address: "تم تحديد الموقع مباشرة من الخريطة",
            placeId: "",
          });

          setStatus("تم تحديد موقع من الخريطة");
        });

        /*
         * ==================================================
         * سحب Marker
         * ==================================================
         */

        marker.addListener("dragend", (event: any) => {
          if (!event.latLng) return;

          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          setSelectedLocation({
            lat,
            lng,
            placeName: "موقع محدد يدويًا",
            address: "تم تحريك علامة الموقع يدويًا",
            placeId: "",
          });

          setStatus("تم تحديث الموقع بعد تحريك العلامة");
        });

        setStatus("Google Maps و Places متصلتان بنجاح");
      } catch (error) {
        console.error("Google Maps initialization error:", error);

        setStatus("حدث خطأ أثناء تشغيل Google Maps أو Places");
      }
    }

    /*
     * إذا Google Maps موجودة بالفعل
     */
    if (window.google?.maps) {
      initMap();

      return () => {
        destroyed = true;
      };
    }

    /*
     * منع تحميل Script مرتين
     */
    const existingScript = document.querySelector(
      'script[data-arees-google-maps="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", initMap);

      return () => {
        destroyed = true;
        existingScript.removeEventListener("load", initMap);
      };
    }

    /*
     * تحميل Google Maps
     */
    const script = document.createElement("script");

    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${apiKey}` +
      `&v=weekly` +
      `&language=ar` +
      `&region=SA`;

    script.async = true;
    script.defer = true;

    script.dataset.areesGoogleMaps = "true";

    script.onload = initMap;

    script.onerror = () => {
      setStatus("تعذر تحميل Google Maps");
    };

    document.head.appendChild(script);

    return () => {
      destroyed = true;
      script.onload = null;
    };
  }, []);

  /*
   * ==================================================
   * GPS
   * ==================================================
   */

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setStatus("جاري تحديد موقعك...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setSelectedLocation({
          lat: location.lat,
          lng: location.lng,
          placeName: "موقعي الحالي",
          address: "تم تحديد الموقع بواسطة GPS",
          placeId: "",
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(location);
          mapInstanceRef.current.setZoom(17);
        }

        if (markerRef.current) {
          markerRef.current.setPosition(location);
        }

        setStatus("تم تحديد موقعك بنجاح");
      },

      (error) => {
        console.error("Geolocation error:", error);

        setStatus(
          "تعذر تحديد الموقع. تأكد من السماح للمتصفح بالوصول إلى موقعك."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /*
   * ==================================================
   * نسخ الإحداثيات
   * ==================================================
   */

  const copyCoordinates = async () => {
    if (!selectedLocation) return;

    const value =
      `${selectedLocation.lat.toFixed(6)}, ` +
      `${selectedLocation.lng.toFixed(6)}`;

    await navigator.clipboard.writeText(value);

    setStatus("تم نسخ الإحداثيات");
  };

  /*
   * ==================================================
   * نسخ بيانات المكان
   * ==================================================
   */

  const copyLocationData = async () => {
    if (!selectedLocation) return;

    const value = `
اسم المكان: ${selectedLocation.placeName}
العنوان: ${selectedLocation.address}
Latitude: ${selectedLocation.lat.toFixed(6)}
Longitude: ${selectedLocation.lng.toFixed(6)}
Place ID: ${selectedLocation.placeId || "—"}
`.trim();

    await navigator.clipboard.writeText(value);

    setStatus("تم نسخ بيانات المكان كاملة");
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] px-5 py-8 text-[#0D3B34]"
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8">
          <div className="mb-3 text-xs font-bold tracking-[0.25em] text-[#C3911A]">
            AREES LOOP / MAP TEST
          </div>

          <h1 className="text-4xl font-bold">
            اختبار Google Maps
          </h1>

          <p className="mt-3 text-sm text-[#0D3B34]/60">
            البحث عن المواقع واختيار موقع الخدمة وحفظ بيانات المكان
            داخل منصة أريس لوب.
          </p>
        </div>

        {/* SEARCH */}

        <section className="mb-5 rounded-[28px] border border-[#0D3B34]/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#C3911A]">
                GOOGLE PLACES
              </p>

              <h2 className="mt-1 text-lg font-bold">
                ابحث عن مكان
              </h2>
            </div>

            <span className="rounded-full bg-[#EAF5EE] px-3 py-2 text-[10px] font-bold text-[#267247]">
              Places API New
            </span>
          </div>

          {/* Google Autocomplete الجديد */}

          <div
            ref={autocompleteContainerRef}
            className="arees-place-autocomplete min-h-[58px]"
          />

          <p className="mt-3 text-xs leading-6 text-[#0D3B34]/48">
            اكتب اسم المكان ثم اختر النتيجة الصحيحة من اقتراحات Google.
          </p>
        </section>

        {/* MAP */}

        <div className="rounded-[32px] border border-[#0D3B34]/10 bg-white p-3">
          <div
            ref={mapRef}
            className="h-[540px] w-full overflow-hidden rounded-[26px] bg-[#ECE9DF]"
          />
        </div>

        {/* DETAILS */}

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          {/* ACTIONS */}

          <section className="rounded-[28px] border border-[#0D3B34]/10 bg-white p-5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#C3911A]">
              LOCATION ACTIONS
            </p>

            <h2 className="mt-2 text-xl font-bold">
              تحديد الموقع
            </h2>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={useMyLocation}
                className="w-full rounded-2xl bg-[#0D4B42] px-5 py-4 text-sm font-bold text-white transition hover:opacity-90"
              >
                استخدام موقعي الحالي
              </button>

              <button
                type="button"
                onClick={copyCoordinates}
                disabled={!selectedLocation}
                className="w-full rounded-2xl border border-[#0D3B34]/12 bg-white px-5 py-4 text-sm font-bold transition hover:bg-[#F7F4EA] disabled:opacity-40"
              >
                نسخ الإحداثيات
              </button>

              <button
                type="button"
                onClick={copyLocationData}
                disabled={!selectedLocation}
                className="w-full rounded-2xl border border-[#D4AF37]/25 bg-[#FFF9E8] px-5 py-4 text-sm font-bold text-[#8C6813] disabled:opacity-40"
              >
                نسخ بيانات المكان كاملة
              </button>
            </div>
          </section>

          {/* LOCATION DATA */}

          <section className="rounded-[28px] border border-[#0D3B34]/10 bg-white p-5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#C3911A]">
              SELECTED LOCATION
            </p>

            <h2 className="mt-2 text-xl font-bold">
              بيانات الموقع المختار
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <InfoCard
                label="اسم المكان / Place Name"
                value={selectedLocation?.placeName || "—"}
              />

              <InfoCard
                label="Place ID"
                value={selectedLocation?.placeId || "—"}
                ltr
              />

              <InfoCard
                label="Latitude / خط العرض"
                value={
                  selectedLocation
                    ? selectedLocation.lat.toFixed(6)
                    : "—"
                }
                ltr
              />

              <InfoCard
                label="Longitude / خط الطول"
                value={
                  selectedLocation
                    ? selectedLocation.lng.toFixed(6)
                    : "—"
                }
                ltr
              />
            </div>

            <div className="mt-3 rounded-[20px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-4">
              <p className="text-[10px] text-[#0D3B34]/45">
                العنوان / Formatted Address
              </p>

              <p className="mt-2 text-sm font-bold leading-7">
                {selectedLocation?.address || "—"}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-[20px] bg-[#EAF5EE] px-4 py-4">
              <div>
                <p className="text-[10px] font-bold text-[#267247]/65">
                  CONNECTION STATUS
                </p>

                <p className="mt-1 text-xs font-bold text-[#267247]">
                  {status}
                </p>
              </div>

              <div className="h-3 w-3 rounded-full bg-[#D4AF37]" />
            </div>
          </section>
        </div>

        {/* PLATFORM */}

        <section className="mt-5 rounded-[28px] bg-[#0D3B34] p-6 text-white">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#E6C24D]">
            AREES LOOP LOCATION ENGINE
          </p>

          <h2 className="mt-2 text-xl font-bold">
            محرك المواقع في أريس لوب
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/60">
            سيتم لاحقًا نقل هذا المكوّن إلى نموذج إضافة الخدمة ليحفظ
            اسم المكان والعنوان وPlace ID والإحداثيات مع الخدمة.
          </p>
        </section>
      </div>

      <style jsx global>{`
        .arees-place-autocomplete gmp-place-autocomplete {
          width: 100%;
          min-height: 58px;
          border-radius: 18px;
          direction: rtl;
        }

        .arees-place-autocomplete {
          width: 100%;
          position: relative;
          z-index: 50;
        }
      `}</style>
    </main>
  );
}

function InfoCard({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-4">
      <p className="text-[10px] text-[#0D3B34]/45">
        {label}
      </p>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className="mt-2 break-all text-sm font-bold"
      >
        {value}
      </p>
    </div>
  );
}