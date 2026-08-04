"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-gradient-to-r from-navy-800 to-navy-700 p-4">
        <h1 className="text-white font-semibold text-lg">SIMPATI</h1>
      </div>
      <main className="flex-1 pb-20 p-4">
        {children}
      </main>
    </div>
  );
}
