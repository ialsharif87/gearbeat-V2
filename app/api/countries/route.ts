import { NextResponse } from "next/server";
import { getActiveCountries } from "@/lib/countries-server";

export async function GET() {
  try {
    const countries = await getActiveCountries();
    return NextResponse.json(countries);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
