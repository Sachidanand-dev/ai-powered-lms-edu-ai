import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { logo } from '../assets/icons';

const Avatar = ({ name, size = 8 }) => {
  const initials = (name || 'U')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`inline-flex h-${size} w-${size} items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold`}
      title={name || 'User'}
      aria-hidden="true"
    >
      {initials || 'U'}
    </div>
  );
};

const ActiveLink = ({ to, children, className = '' }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `${className} px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'text-blue-600 dark:text-blue-400 font-semibold'
          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
      }`
    }
    end
  >
    {children}
  </NavLink>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // close menus on route change or escape
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const handleLogout = () => {
    logout && logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3" aria-label="Home">
              <span className="sr-only">EduAI</span>
              <div className="dark:bg-slate-100 rounded-md">
                <img src={`${logo}`} alt="" className='h-10'/>
              </div>
              
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!user ? (
              <>
                <ActiveLink to="/login">Login</ActiveLink>
                <ActiveLink to="/register">Register</ActiveLink>
              </>
            ) : (
              <>
                {user.role === 'admin' ? (
                  <ActiveLink to="/admin">Dashboard</ActiveLink>
                ) : (
                  <>
                    <ActiveLink to="/student">Dashboard</ActiveLink>
                    <ActiveLink to="/ai-study">AI Study</ActiveLink>
                    <ActiveLink to="/quiz">Quiz</ActiveLink>
                  </>
                )}

                <ActiveLink to="/settings">Settings</ActiveLink>

                {/* Avatar + dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((s) => !s)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    className="ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="h-8 w-8">
                      <Avatar name={user.name || user.email || 'User'} size={8} />
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name || 'You'}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{user.role || 'student'}</span>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div
                      role="menu"
                      aria-label="User menu"
                      className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((s) => !s)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
              className="p-2 rounded-md inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden transform transition-all duration-200 ease-in-out overflow-hidden ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700`}
        aria-hidden={!mobileOpen}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {!user ? (
            <>
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`
                }
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`
                  }
                >
                  Dashboard
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/student"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/ai-study"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`
                    }
                  >
                    AI Study
                  </NavLink>
                  <NavLink
                    to="/quiz"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`
                    }
                  >
                    Quiz
                  </NavLink>
                </>
              )}

              <NavLink
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`
                }
              >
                Settings
              </NavLink>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



// import { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import ThemeToggle from './ThemeToggle';

// const Navbar = () => {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [isMenuOpen, setIsMenuOpen] = useState(false);

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//         setIsMenuOpen(false);
//     };

//     const toggleMenu = () => {
//         setIsMenuOpen(!isMenuOpen);
//     };

//     const closeMenu = () => {
//         setIsMenuOpen(false);
//     };

//     const isActive = (path) => {
//         return location.pathname === path ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400';
//     };

//     return (
//         <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="flex justify-between h-16">
//                     <div className="flex items-center">
//                         <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
//                             <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">EduAI</span>
//                         </Link>
//                     </div>

//                     {/* Desktop Menu */}
//                     <div className="hidden md:flex items-center space-x-4">
//                         {!user ? (
//                             <>
//                                 <Link to="/login" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/login')}`}>
//                                     Login
//                                 </Link>
//                                 <Link to="/register" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/register')}`}>
//                                     Register
//                                 </Link>
//                             </>
//                         ) : (
//                             <>
//                                 {user.role === 'admin' ? (
//                                     <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin')}`}>
//                                         Dashboard
//                                     </Link>
//                                 ) : (
//                                     <>
//                                         <Link to="/student" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student')}`}>
//                                             Dashboard
//                                         </Link>
//                                         <Link to="/ai-study" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/ai-study')}`}>
//                                             AI Study
//                                         </Link>
//                                         <Link to="/quiz" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/quiz')}`}>
//                                             Quiz
//                                         </Link>
//                                     </>
//                                 )}
//                                 <Link to="/settings" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/settings')}`}>
//                                     Settings
//                                 </Link>
//                                 <button
//                                     onClick={handleLogout}
//                                     className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                                 >
//                                     Logout
//                                 </button>
//                             </>
//                         )}
//                         <ThemeToggle />
//                     </div>

//                     {/* Mobile menu button */}
//                     <div className="flex items-center md:hidden space-x-4">
//                         <ThemeToggle />
//                         <button
//                             onClick={toggleMenu}
//                             className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
//                             aria-expanded="false"
//                         >
//                             <span className="sr-only">Open main menu</span>
//                             {isMenuOpen ? (
//                                 <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             ) : (
//                                 <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//                                 </svg>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Mobile Menu */}
//             {isMenuOpen && (
//                 <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
//                     <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//                         {!user ? (
//                             <>
//                                 <Link to="/login" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/login')}`} onClick={closeMenu}>
//                                     Login
//                                 </Link>
//                                 <Link to="/register" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/register')}`} onClick={closeMenu}>
//                                     Register
//                                 </Link>
//                             </>
//                         ) : (
//                             <>
//                                 {user.role === 'admin' ? (
//                                     <Link to="/admin" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin')}`} onClick={closeMenu}>
//                                         Dashboard
//                                     </Link>
//                                 ) : (
//                                     <>
//                                         <Link to="/student" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/student')}`} onClick={closeMenu}>
//                                             Dashboard
//                                         </Link>
//                                         <Link to="/ai-study" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/ai-study')}`} onClick={closeMenu}>
//                                             AI Study
//                                         </Link>
//                                         <Link to="/quiz" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/quiz')}`} onClick={closeMenu}>
//                                             Quiz
//                                         </Link>
//                                     </>
//                                 )}
//                                 <Link to="/settings" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/settings')}`} onClick={closeMenu}>
//                                     Settings
//                                 </Link>
//                                 <button
//                                     onClick={handleLogout}
//                                     className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                                 >
//                                     Logout
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </nav>
//     );
// };

// export default Navbar;
