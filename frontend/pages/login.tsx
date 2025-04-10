import Link from 'next/link';
import { useState } from 'react';
import Footer from '../components/footer';

export default function Login()
{
    const [result, setResult] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function login()
    {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const json = await response.json();
        setResult(JSON.stringify(json));
        if (json.success === true)
        {
            window.location.href = '/';
        }
    }

    return (
<div className="FitCheck min-h-screen bg-white flex flex-col">
      {/* <Header /> */}

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-gray-50 p-8 rounded-2xl shadow-md border border-gray-200">
          <h1 className="font-bold mb-6 text-center">Welcome To Your Closet 👋</h1>

          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={50}
              className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={50}
              className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <button
              onClick={login}
              className="w-full bold bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all"
            >
              LOGIN
            </button>

            {result && <p className="text-center text-gray-600">{result}</p>}

            <p className="text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-blue-500 underline hover:text-blue-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    );
}