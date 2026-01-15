function LoginForm({ onSwitch }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await loginUser(username, password);
      if (result.success) {
        // Save session
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md transition-colors duration-200" data-name="login-form">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="icon-shopping-cart text-3xl text-blue-600 dark:text-blue-400"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center">
            <div className="icon-circle-alert mr-2"></div>
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 icon-user"></div>
            <input
              type="text"
              required
              className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 icon-lock"></div>
            <input
              type="password"
              required
              className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account? 
        <button onClick={onSwitch} className="text-blue-600 dark:text-blue-400 font-medium hover:underline ml-1">
          Register now
        </button>
      </div>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('customer');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await registerUser(username, password, role);
      if (result.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
            onSwitch();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md transition-colors duration-200" data-name="register-form">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <p className="text-gray-500 dark:text-gray-400">Join our supermarket chain</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center">
            <div className="icon-circle-alert mr-2"></div>
            {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-center">
            <div className="icon-circle-check mr-2"></div>
            {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
          <input
            type="text"
            required
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input
            type="password"
            required
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin (Staff)</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account? 
        <button onClick={onSwitch} className="text-blue-600 dark:text-blue-400 font-medium hover:underline ml-1">
          Sign in
        </button>
      </div>
    </div>
  );
}
