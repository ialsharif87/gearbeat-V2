export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gb-portal-layout">
      {children}
    </div>
  );
}
