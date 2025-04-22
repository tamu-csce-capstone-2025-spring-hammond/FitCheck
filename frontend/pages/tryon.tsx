import { useState, useEffect } from 'react';

export default function VirtualTryOn() {
  // 1) your two S3 images
  const PERSON_URL  =
    "https://hack-fitcheck.s3.amazonaws.com/51ef1382-26a3-4d7d-95bb-04d7aacb4459_photo.jpg";
  const CLOTH_URL   =
    "https://hack-fitcheck.s3.amazonaws.com/aee47085-ee86-426b-85a5-8c49760d5a70_photo.jpg";

  // 2) state for previews + result
  const [personImage]       = useState(PERSON_URL);
  const [clothingImage]     = useState(CLOTH_URL);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading,    setLoading]  = useState(false);
  const [error,      setError]    = useState<string | null>(null);

  // 3) when component mounts, fire off your try‑on
  useEffect(() => {
    handleTryOn();
  }, []);

  // 4) call your API which in turn calls the HF space
  const handleTryOn = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/virtual-try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personImageUrl: PERSON_URL,
          clothingImageUrl: CLOTH_URL,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || res.statusText);
      }

      const { resultUrl } = await res.json();
      setResultUrl(resultUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Try‑on failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Try‑On</h1>

      {/* previews */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/** Person **/}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Person</h2>
          <div className="w-40 h-40 mb-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
            <img
              src={personImage}
              alt="Person"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/** Clothing **/}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Clothing</h2>
          <div className="w-40 h-40 mb-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
            <img
              src={clothingImage}
              alt="Clothing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* status */}
      {loading && (
        <p className="text-center text-gray-600 mb-4">Processing…</p>
      )}
      {error && (
        <p className="text-center text-red-500 mb-4">{error}</p>
      )}

      {/* result */}
      {resultUrl && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Result
          </h2>
          <div className="flex justify-center">
            <img
              src={resultUrl}
              alt="Virtual Try‑On Result"
              className="max-w-full max-h-96 rounded-lg shadow"
            />
          </div>
        </div>
      )}
    </div>
  );
}
