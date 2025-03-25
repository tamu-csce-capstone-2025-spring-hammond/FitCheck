import Link from 'next/link';
import { useState } from 'react';

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
        <div className="bg-white">
            <h1>Test Login</h1>
            <p><Link href="/signup" className="underline text-blue-500">Signup</Link></p>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} maxLength={50} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} maxLength={50} />
            <br />
            <button onClick={login} className="p-2 border-2 rounded-xl border-black">Login</button>
            <p>{result}</p>
        </div>
    );
}