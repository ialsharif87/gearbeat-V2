import "./globals.css";
import Link from "next/link";
import { getCurrentProfile, getDashboardPath } from "../lib/auth";
import LogoutButton from "../components/logout-button";

export const metadata = {
  title: "GearBeat",
  description: "Premium studio booking marketplace"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await getCurrentProfile();

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">
              Gear<span>Beat</span>
            </Link>

            <nav className="nav-links">
              <Link href="/studios">Studios</Link>

              {profile ? (
                <>
                  <Link href={getDashboardPath(profile.role)}>Dashboard</Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login">Login</Link>
                  <Link href="/signup" className="btn btn-small">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="container page">{children}</main>
      </body>
    </html>
  );
}
