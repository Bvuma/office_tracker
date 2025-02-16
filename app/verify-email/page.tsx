'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure client-side execution
      const token = searchParams.get('token');

      if (!token) {
        setError('No token found.');
        setLoading(false);
        return;
      }

      const verifyToken = async () => {
        try {
          const response = await fetch('/api/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (response.ok) {
            setEmailVerified(true);
          } else {
            setError(data.message || 'Invalid token.');
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      verifyToken();
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        {loading ? (
          <>
            <p>Loading...</p>
            <div className="mt-2">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
            </div>
          </>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : emailVerified ? (
          <p className="text-green-500">Your email has been successfully verified!</p>
        ) : (
          <p className="text-red-500">There was an issue verifying your email. Please try again later.</p>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
