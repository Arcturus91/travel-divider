"use client";

import Navigation from "@/components/Navigation";

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow">{children}</div>
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Travel Divider. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}