// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to DoveNet</h1>
          <p className="text-lg md:text-2xl mb-8">
            Your ultimate pigeon management system. Track, manage, and monitor your pigeons effortlessly.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose DoveNet?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Easy Tracking</h3>
              <p>Keep track of your pigeons' health, breeding, and performance in one place.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Smart Analytics</h3>
              <p>Analyze your pigeons' data with built-in stats and insights to make informed decisions.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Community Support</h3>
              <p>Connect with other pigeon enthusiasts and share knowledge effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="mb-8 text-lg md:text-xl">Join DoveNet today and elevate your pigeon management experience.</p>
        <Link
          to="/register"
          className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Create Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} DoveNet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
