import { useEffect } from 'react';

export default function Logout()
{
    useEffect(() =>
    {
        async function logout()
        {
            await fetch('/api/logout', {
                method: 'POST',
            });
            window.location.href = '/';
        }
        logout();
    }, []);

    return (
        <div className="bg-white">
            <p>Logging you out... you should be redirected shortly!</p>
        </div>
    );
}