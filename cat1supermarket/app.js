// Important: DO NOT remove this `ErrorBoundary` component.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [view, setView] = React.useState('login'); // 'login' or 'register'

  React.useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      window.location.href = 'dashboard.html';
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-0"></div>
      
      {/* Absolute positioned toggle for login page */}
      <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur rounded-full p-1">
         <ThemeToggle />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">SuperMart Distributed</h1>
        <p className="text-blue-100 text-lg mb-8">Seamless Shopping Across Branches</p>
        
        {view === 'login' ? (
          <LoginForm onSwitch={() => setView('register')} />
        ) : (
          <RegisterForm onSwitch={() => setView('login')} />
        )}
      </div>

       <div className="relative z-10 mt-8 text-white/60 text-sm">
        &copy; 2026 Supermarket Chain System
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);