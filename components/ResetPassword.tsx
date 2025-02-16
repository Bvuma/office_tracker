'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function ResetPassword() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>You must be logged in to reset your password.</div>;
  }

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = new FormData(event.target as HTMLFormElement);
    const newPassword = form.get('newPassword') as string;
    const confirmPassword = form.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      return alert('Passwords do not match.');
    }

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email, newPassword }),
      });

      if (res.ok) {
        alert('Password reset successful!');
      } else {
        throw new Error('Password reset failed.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handlePasswordReset}>
        <div>
          <label htmlFor="newPassword">New Password</label>
          <input type="password" id="newPassword" name="newPassword" required />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
