"use client";

import Link from "next/link";
import { useState } from "react";

export default function TripsPage() {
  // This would be fetched from an API in a real app
  const [trips, setTrips] = useState([
    {
      id: "1",
      name: "Cancun Beach Vacation",
      startDate: "2025-06-10",
      endDate: "2025-06-17",
      participants: 4,
      totalExpenses: 2450,
    },
    {
      id: "2",
      name: "New York City Weekend",
      startDate: "2025-05-15",
      endDate: "2025-05-18",
      participants: 3,
      totalExpenses: 1850,
    },
  ]);

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Manage your trips and track expenses with friends.
            </p>
          </div>
          <Link
            href="/trips/new"
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Create New Trip
          </Link>
        </div>

        {trips.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{trip.name}</h2>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-600 text-sm">
                        {trip.participants} participants
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-blue-600">
                        ${trip.totalExpenses}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first trip to start tracking expenses.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create New Trip
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}