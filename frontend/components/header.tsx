import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="FitCheck _site-grid shadow-md">
      <div className="_grid-3">
        <div className="flex justify-between items-center py-4">
          <h1 className="header text-accent">
            <Link href="/" className="text-inherit no-underline">
              FitCheck
            </Link>
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-md shadow-lg py-1 z-50">
                <Link href="/profile" className="block px-4 py-2 text-sm md:text-base text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm md:text-base text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}