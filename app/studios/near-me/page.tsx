"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import T from "@/components/t";
import GoogleMapsLink from "@/components/google-maps-link";
import { createClient } from "@/lib/supabase/client";
import {
  calculateDistanceKm,
  formatDistanceKm,
  hasValidCoordinates,
  parseCoordinate,
} from "@/lib/locations";

type StudioRow = {
  id: string;
  slug: string | null;
  name_en: string | null;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  price_from: number | null;
  city_name: string | null;
  district: string | null;
  address_line: string | null;
  google_maps_url: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  verified_location: boolean | null;
  verified: boolean | null;
  status: string | null;
  booking_enabled: boolean | null;
};

type UserCoordinates = {
  latitude: number;
  longitude: number;
};

function getStudioName(studio: StudioRow) {
  return studio.name_en || studio.name_ar || "Studio";
}

function getStudioHref(studio: StudioRow) {
  if (studio.slug) {
    return `/studios/${studio.slug}`;
  }

  return `/studios/${studio.id}`;
}

function getStudioDistance(
  studio: StudioRow,
  userCoordinates: UserCoordinates | null
) {
  if (!userCoordinates) {
    return null;
  }

  const latitude = parseCoordinate(studio.latitude);
  const longitude = parseCoordinate(studio.longitude);

  if (
    latitude === null ||
    longitude === null ||
    !hasValidCoordinates({ latitude, longitude })
  ) {
    return null;
  }

  return calculateDistanceKm(userCoordinates, {
    latitude,
    longitude,
  });
}

export default function StudiosNearMePage() {
  const [studios, setStudios] = useState<StudioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userCoordinates, setUserCoordinates] =
    useState<UserCoordinates | null>(null);
  const [locationError, setLocationError] = useState("");
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    async function loadStudios() {
      setLoading(true);
      setDataError("");

      const supabase = createClient();

      const { data, error } = await supabase
        .from("studios")
        .select(`
          id,
          slug,
          name_en,
          name_ar,
          description_en,
          description_ar,
          price_from,
          city_name,
          district,
          address_line,
          google_maps_url,
          latitude,
          longitude,
          verified_location,
          verified,
          status,
          booking_enabled
        `)
        .eq("status", "approved")
        .eq("booking_enabled", true)
        .order("created_at", { ascending: false })
        .limit(80);

      if (error) {
        console.error("Near me studios error:", error);
        setDataError("Could not load studios.");
        setLoading(false);
        return;
      }

      setStudios((data || []) as StudioRow[]);
      setLoading(false);
    }

    loadStudios();
  }, []);

  function requestLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      (error) => {
        console.error("Browser location error:", error);

        setLocationError(
          "Location permission was not allowed. You can still browse studios by city."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }

  const studiosWithDistance = useMemo(() => {
    return studios
      .map((studio) => ({
        studio,
        distanceKm: getStudioDistance(studio, userCoordinates),
      }))
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) {
          return 0;
        }

        if (a.distanceKm === null) {
          return 1;
        }

        if (b.distanceKm === null) {
          return -1;
        }

        return a.distanceKm - b.distanceKm;
      });
  }, [studios, userCoordinates]);

  return (
    <main className="dashboard-page" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <section
        className="card"
        style={{
          padding: 32,
          marginTop: 24,
          background:
            "linear-gradient(135deg, rgba(207,167,98,0.16), rgba(255,255,255,0.04))",
        }}
      >
        <span className="badge badge-gold">
          <T en="Studios Near Me" ar="استوديوهات قريبة مني" />
        </span>

        <h1 style={{ marginTop: 12 }}>
          <T
            en="Find studios around you"
            ar="اكتشف الاستوديوهات القريبة منك"
          />
        </h1>

        <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 760 }}>
          <T
            en="Allow location access to sort studios by distance. You can also open any studio directly in Google Maps."
            ar="اسمح بالوصول إلى موقعك لترتيب الاستوديوهات حسب الأقرب. ويمكنك فتح موقع أي استوديو مباشرة في Google Maps."
          />
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={requestLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <T en="Getting location..." ar="جاري تحديد الموقع..." />
            ) : (
              <T en="Use my location" ar="استخدم موقعي" />
            )}
          </button>

          <Link href="/studios" className="btn">
            <T en="Browse all studios" ar="تصفح كل الاستوديوهات" />
          </Link>
        </div>

        {userCoordinates ? (
          <p style={{ color: "#00ff88", marginTop: 14 }}>
            <T
              en="Location enabled. Studios are now sorted by distance."
              ar="تم تفعيل الموقع. يتم الآن ترتيب الاستوديوهات حسب الأقرب."
            />
          </p>
        ) : null}

        {locationError ? (
          <p style={{ color: "#ffb020", marginTop: 14 }}>
            {locationError}
          </p>
        ) : null}

        {dataError ? (
          <p style={{ color: "#ff4d4d", marginTop: 14 }}>
            {dataError}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 28 }}>
        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <T en="Loading studios..." ar="جاري تحميل الاستوديوهات..." />
          </div>
        ) : studiosWithDistance.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <h2>
              <T en="No studios found" ar="لا توجد استوديوهات" />
            </h2>
            <p style={{ color: "var(--muted)" }}>
              <T
                en="No approved studios are available right now."
                ar="لا توجد استوديوهات معتمدة متاحة حاليًا."
              />
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {studiosWithDistance.map(({ studio, distanceKm }) => {
              const addressParts = [
                studio.district,
                studio.city_name,
              ].filter(Boolean);

              return (
                <article key={studio.id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h2 style={{ marginBottom: 6 }}>
                        {getStudioName(studio)}
                      </h2>

                      <p style={{ color: "var(--muted)", margin: 0 }}>
                        {addressParts.length > 0
                          ? addressParts.join(", ")
                          : "Location details coming soon"}
                      </p>
                    </div>

                    {studio.verified_location || studio.verified ? (
                      <span className="badge badge-success">
                        <T en="Verified" ar="موثق" />
                      </span>
                    ) : null}
                  </div>

                  <p
                    style={{
                      marginTop: 14,
                      color: "var(--muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    {studio.description_en ||
                      studio.description_ar ||
                      "Premium creative studio on GearBeat."}
                  </p>

                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        <T en="Starts from" ar="يبدأ من" />
                      </div>

                      <strong>
                        {Number(studio.price_from || 0).toFixed(2)} SAR
                      </strong>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        <T en="Distance" ar="المسافة" />
                      </div>

                      <strong>
                        {distanceKm === null
                          ? "—"
                          : formatDistanceKm(distanceKm)}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href={getStudioHref(studio)} className="btn btn-primary">
                      <T en="View Studio" ar="عرض الاستوديو" />
                    </Link>

                    <GoogleMapsLink
                      googleMapsUrl={studio.google_maps_url}
                      latitude={studio.latitude}
                      longitude={studio.longitude}
                      cityName={studio.city_name}
                      district={studio.district}
                      addressLine={studio.address_line}
                      mode="directions"
                      className="btn"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
