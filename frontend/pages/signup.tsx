import Link from 'next/link';
import { useState } from 'react';

export default function Signup()
{
    const [result, setResult] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function signup()
    {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        const json = await response.json();
        setResult(JSON.stringify(json));

        if (json.success)
        {
            window.location.href = '/';
        }
    }

    return (
        <div className="bg-white">
            <h1>Test Signup</h1>
            <p><Link href="/login" className="underline text-blue-500">Login</Link></p>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} maxLength={50} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} maxLength={50} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} maxLength={50} />
            <br />
            <button onClick={signup} className="p-2 border-2 rounded-xl border-black">Signup</button>
            <p>{result}</p>
        </div>
    );
}