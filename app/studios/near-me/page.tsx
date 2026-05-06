"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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
  const [locationError, setLocationError] = useState<React.ReactNode>(null);
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

  function performGeolocation() {
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
        
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            <T 
              en="Please allow location access in your browser settings" 
              ar="يرجى السماح بالوصول إلى موقعك من إعدادات المتصفح" 
            />
          );
        } else {
          setLocationError(
            <T 
              en="Could not get your location, try searching by city" 
              ar="تعذر تحديد موقعك، جرب البحث بالمدينة" 
            />
          );
        }
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  async function requestLocation() {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(
        <T 
          en="Your browser does not support location access." 
          ar="متصفحك لا يدعم الوصول إلى الموقع." 
        />
      );
      return;
    }

    // Try permissions API first if available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (result.state === 'denied') {
          setLocationError(
            <T 
              en="Please allow location access in your browser settings" 
              ar="يرجى السماح بالوصول إلى موقعك من إعدادات المتصفح" 
            />
          );
          return;
        }
      } catch (e) {
        console.warn("Permissions API query failed", e);
      }
    }

    performGeolocation();
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
    <main className="container gb-dashboard-page">
      <section className="gb-card animate-up" style={{ borderLeft: '4px solid var(--gb-gold)' }}>
        <span className="badge-gold">
          <T en="Studios Near Me" ar="استوديوهات قريبة مني" />
        </span>

        <h1 style={{ marginTop: 20 }}>
          <T
            en="Find studios around you"
            ar="اكتشف الاستوديوهات القريبة منك"
          />
        </h1>

        <p className="gb-muted-text">
          <T
            en="Allow location access to sort studios by distance. You can also open any studio directly in Google Maps."
            ar="اسمح بالوصول إلى موقعك لترتيب الاستوديوهات حسب الأقرب. ويمكنك فتح موقع أي استوديو مباشرة في Google Maps."
          />
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
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

          <Link href="/studios" className="btn btn-outline">
            <T en="Browse all studios" ar="تصفح كل الاستوديوهات" />
          </Link>
        </div>

        {userCoordinates ? (
          <p style={{ color: "var(--gb-teal)", marginTop: 16, fontWeight: 700, fontSize: '0.9rem' }}>
            ✓ <T
              en="Location enabled. Studios are now sorted by distance."
              ar="تم تفعيل الموقع. يتم الآن ترتيب الاستوديوهات حسب الأقرب."
            />
          </p>
        ) : null}

        {locationError ? (
          <p style={{ color: "#ffb020", marginTop: 16, fontSize: '0.9rem' }}>
            ⚠ {locationError}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 8 }}>
        {loading ? (
          <div className="gb-empty-state">
            <T en="Loading studios..." ar="جاري تحميل الاستوديوهات..." />
          </div>
        ) : studiosWithDistance.length === 0 ? (
          <div className="gb-empty-state">
            <h2>
              <T en="No studios found" ar="لا توجد استوديوهات" />
            </h2>
            <p>
              <T
                en="No approved studios are available right now."
                ar="لا توجد استوديوهات معتمدة متاحة حاليًا."
              />
            </p>
          </div>
        ) : (
          <div className="gb-card-grid">
            {studiosWithDistance.map(({ studio, distanceKm }) => {
              const addressParts = [
                studio.district,
                studio.city_name,
              ].filter(Boolean);

              return (
                <article key={studio.id} className="gb-card animate-up">
                  <div className="gb-card-header">
                    <div>
                      <h2>{getStudioName(studio)}</h2>
                      <p className="gb-muted-text" style={{ fontSize: '0.85rem' }}>
                        {addressParts.length > 0
                          ? addressParts.join(", ")
                          : "Location details coming soon"}
                      </p>
                    </div>

                    {studio.verified_location || studio.verified ? (
                      <span className="badge-gold" style={{ fontSize: '0.65rem' }}>
                        <T en="Verified" ar="موثق" />
                      </span>
                    ) : null}
                  </div>

                  <p className="gb-muted-text" style={{ minHeight: 60, fontSize: '0.9rem' }}>
                    {studio.description_en ||
                      studio.description_ar ||
                      "Premium creative studio on GearBeat."}
                  </p>

                  <div className="gb-detail-grid" style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--gb-border)' }}>
                    <div>
                      <span className="gb-detail-label"><T en="Starts from" ar="يبدأ من" /></span>
                      <strong>{Number(studio.price_from || 0).toFixed(0)} SAR</strong>
                    </div>

                    <div style={{ textAlign: 'end' }}>
                      <span className="gb-detail-label"><T en="Distance" ar="المسافة" /></span>
                      <strong style={{ color: 'var(--gb-teal)' }}>
                        {distanceKm === null
                          ? "—"
                          : formatDistanceKm(distanceKm)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <Link href={getStudioHref(studio)} className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                      <T en="View" ar="عرض" />
                    </Link>

                    <div style={{ flex: 1 }}>
                      <GoogleMapsLink
                        googleMapsUrl={studio.google_maps_url}
                        latitude={studio.latitude}
                        longitude={studio.longitude}
                        cityName={studio.city_name}
                        district={studio.district}
                        addressLine={studio.address_line}
                        mode="directions"
                        className="btn btn-outline"
                      />
                    </div>
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
