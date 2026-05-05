import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-6">
      <h1 className="text-3xl font-bold text-white mb-1">
        Hey, {session?.user?.name ?? "there"} 👋
      </h1>
      <p className="text-slate-400 text-sm mb-6">
        Your mood journal is ready. Start logging to see your stats here.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4 ">
        {[
          { label: "Total Entries", value: "—" },
          { label: "This Week", value: "—" },
          { label: "Top Mood", value: "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-xl bg-slate-900 border border-white/10 p-4 flex flex-col
                      transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]
                      hover:border-primary!
                      "
          >
            <p className="text-slate-400 text-xs mb-2 leading-tight">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-700 p-6 text-center ">
        <p className="text-slate-500 text-sm">
          Your mood timeline will appear here once you log your first entry.
        </p>
      </div>
    </div>
  );
}