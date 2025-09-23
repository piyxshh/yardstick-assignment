
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-white">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Capture Your Ideas, Effortlessly.
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          A secure, multi-tenant environment to manage your notes. Built for speed, security, and simplicity.
        </p>
        <Link href="/login">
          <span className="inline-block px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            Get Started
          </span>
        </Link>
      </div>
      <footer className="absolute bottom-8 text-gray-500">
        <p>Yardstick Notes Assignment</p>
      </footer>
    </main>
  );
}