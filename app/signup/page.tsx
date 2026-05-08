import { Metadata } from "next";
import { getActiveCountries } from "@/lib/countries-server";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Signup | GearBeat",
  description: "Create your GearBeat account to start booking music and audio studios.",
};

export default async function SignupPage() {
  const countries = await getActiveCountries();

  return <SignupClient countries={countries} />;
}
