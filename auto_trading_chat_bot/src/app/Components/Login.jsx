'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify'; // Import toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  // Handle login action
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation (optional)
    if (!email || !password) {
      setError("Email and password are required.");
      toast.error("Email and password are required."); // Show error toast
      return;
    }

    try {
      // Send login request to your backend API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle server errors or bad credentials
        throw new Error(data.message || "Invalid email or password.");
      }

      toast.success("Login successful!"); // Show success toast
      router.push('/Charts');
    } catch (error) {
      setError(error.message || "An error occurred while logging in. Please try again.");
      toast.error(error.message || "An error occurred while logging in. Please try again."); // Show error toast
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex justify-center items-center px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl transform transition duration-500 hover:scale-105'>
        <div className='p-8'>
          <h2 className='text-4xl font-bold text-center text-gray-900 mb-8'>
            Welcome Back
          </h2>

          {error && (
            <div className='text-red-500 text-sm mb-4 text-center'>{error}</div>
          )}

          <form onSubmit={handleLogin} className='space-y-6'>
            <div className='relative'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'>
                Email Address
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            <div className='relative'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'>
                Password
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <input
                  type='password'
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300'
                  placeholder='••••••••'
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300'>
                Login
              </button>
            </div>
          </form>

          <div className='text-center mt-6'>
            <p className='text-sm text-gray-600'>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
                className='text-indigo-600 hover:underline focus:outline-none'>
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ToastContainer to display the toasts */}
      <ToastContainer/>
    </div>
  );
}
