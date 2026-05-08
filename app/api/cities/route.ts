import { NextResponse } from "next/server";
import { getActiveCitiesByCountry, getActiveCities } from "@/lib/locations-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country");

  try {
    const cities = countryCode 
      ? await getActiveCitiesByCountry(countryCode)
      : await getActiveCities();
      
    return NextResponse.json(cities);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
