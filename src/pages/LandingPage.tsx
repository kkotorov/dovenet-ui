import { Link } from 'react-router-dom';
import Pigeon from '../assets/pigeon.svg'; // make sure the SVG file is here

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white overflow-hidden">
        <div className="container mx-auto px-6 py-32 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fadeInUp">
            Welcome to <span className="text-yellow-300">DoveNet</span>
          </h1>
          <p className="text-lg md:text-2xl mb-10 animate-fadeInUp delay-200">
            Your ultimate pigeon management system. Track, manage, and monitor your pigeons effortlessly.
          </p>
          <div className="flex justify-center gap-6 animate-fadeInUp delay-400">
            <Link
              to="/login"
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-transparent border border-white text-white font-semibold px-8 py-4 rounded-xl transform hover:scale-105 hover:bg-white hover:text-blue-600 transition"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 opacity-30 animate-float">
          <img src={Pigeon} alt="Flying Pigeon" className="w-64 mx-auto opacity-30 animate-float" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16 animate-fadeInUp">Why Choose DoveNet?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 animate-fadeInUp delay-100">
              <h3 className="text-2xl font-semibold mb-4">Easy Tracking</h3>
              <p>Keep track of your pigeons' health, breeding, and performance in one place.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 animate-fadeInUp delay-200">
              <h3 className="text-2xl font-semibold mb-4">Smart Analytics</h3>
              <p>Analyze your pigeons' data with built-in stats and insights to make informed decisions.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 animate-fadeInUp delay-300">
              <h3 className="text-2xl font-semibold mb-4">Community Support</h3>
              <p>Connect with other pigeon enthusiasts and share knowledge effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeInUp">Ready to Get Started?</h2>
        <p className="mb-10 text-lg md:text-xl animate-fadeInUp delay-200">
          Join DoveNet today and elevate your pigeon management experience.
        </p>
        <Link
          to="/register"
          className="bg-white text-purple-600 font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition animate-fadeInUp delay-400"
        >
          Create Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} DoveNet. All rights reserved.</p>
      </footer>

      {/* Tailwind Animations */}
      <style>
        {`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 1s forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
}
