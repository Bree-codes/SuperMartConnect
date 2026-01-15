function Header({ user, onLogout }) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="icon-shopping-cart text-white text-lg"></div>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">SuperMart</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
            <div className="icon-user text-gray-500 dark:text-gray-300"></div>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Logout"
          >
            <div className="icon-log-out"></div>
          </button>
        </div>
      </div>
    </header>
  );
}

function Layout({ children, user, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; 2026 Supermarket Chain System. Distributed across 4 branches.
        </div>
      </footer>
    </div>
  );
}
