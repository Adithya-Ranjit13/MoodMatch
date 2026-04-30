import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}