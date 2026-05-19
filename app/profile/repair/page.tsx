import { Metadata } from "next";
import { getActiveCountries } from "@/lib/countries-server";
import ProfileRepairClient from "./ProfileRepairClient";

export const metadata: Metadata = {
  title: "Complete Profile Setup | GearBeat",
  description: "Complete your profile setup to activate your GearBeat account.",
};

export default async function ProfileRepairPage() {
  const countries = await getActiveCountries();

  return <ProfileRepairClient countries={countries} />;
}
