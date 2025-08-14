import { RevalidationProvider } from "@/app/Context/RevalidationContext";

export default function ProductosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RevalidationProvider>{children}</RevalidationProvider>;
}
