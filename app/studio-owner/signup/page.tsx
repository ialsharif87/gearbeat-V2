import { Metadata } from "next";
import { getActiveCountries } from "@/lib/countries-server";
import StudioOwnerSignupClient from "./StudioOwnerSignupClient";

export const metadata: Metadata = {
  title: "Studio Partner Signup | GearBeat",
  description: "Register as a GearBeat Studio Partner to manage bookings, track listings, and grow your audio business.",
};

export default async function StudioOwnerSignupPage() {
  const countries = await getActiveCountries();

  return <StudioOwnerSignupClient countries={countries} />;
}
