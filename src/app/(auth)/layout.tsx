import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center bg-gray-50 px-4 py-10">
      <Link href="/" className="mb-6 text-2xl font-bold text-teal-800">
        KTZ Évalue
      </Link>
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
    </main>
  );
}
