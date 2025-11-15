import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import CompanyLogo from '../assets/company-logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const allowedAdminEmail = 'fitnesszc@gmail.com';

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if the logged-in email matches the allowed admin email
      if (user.email !== allowedAdminEmail) {
        setErrorMessage('You do not have admin access.');
        setIsLoading(false);
        return;
      }

      // If the email matches the allowed admin email, redirect to the manage members page
      setSuccessMessage('Welcome Admin! Redirecting to dashboard...');
      console.log('Admin logged in successfully');

      // Navigate to the admin page after a short delay to show success message
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Login failed: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex mt-12">
      {/* Centered Login Form */}
      <div className="w-full flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Centered Header Section */}
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            {/* Logo */}
            <div className="w-24 h-24 md:w-28 md:h-28 mb-4">
              <img
                src={CompanyLogo}
                alt="Company Logo"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Headings */}
            <div className="space-y-1">
              <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tight leading-none">
                Fitness Zone
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-none">
                Fitness Center
              </h2>
            </div>

            {/* Admin Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-sm">
                Administrator Access
              </span>
            </div>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl ">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Admin Sign In
            </h2>
            {/* Email/Password Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                onClick={handleEmailLogin}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In as Admin'
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
