export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth and nav are handled per-page via JWT + localStorage
  return <>{children}</>
}
