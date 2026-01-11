import { NavLink } from 'react-router-dom';
import { Moon, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Pomodoro', path: '/pomodoro' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Attention Detector', path: '/eco-scan' },
    { name: 'Teaching', path: '/teaching' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav h-20 px-6 md:px-12 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="relative">
             <div className="absolute inset-0 bg-accent blur-md opacity-40 rounded-full"></div>
             <Moon className="relative w-8 h-8 fill-accent text-accent" />
        </div>
        <h1 className="text-2xl font-bold tracking-wide text-text">StudyNest</h1>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium",
                isActive
                  ? "bg-accent text-bg1 shadow-[0_0_20px_rgba(242,161,74,0.4)] scale-105"
                  : "text-muted hover:text-text hover:bg-white/5"
              )
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>
      
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden text-text p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full glass border-t border-card-border p-6 flex flex-col gap-4 md:hidden animate-fade-in">
           {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              cn(
                "px-6 py-3 rounded-xl transition-all duration-300 text-center font-medium",
                isActive
                  ? "bg-accent text-bg1"
                  : "text-muted hover:bg-white/5"
              )
            }
          >
            {item.name}
          </NavLink>
        ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
