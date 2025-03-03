import { Link } from '@tanstack/react-router';
import logo from '@/assets/goose.jpg';
import { Button } from './ui/button';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 border-b border-gray-200">
          <div className="flex-shrink-0">
            <span className="flex flex-row text-xl font-semibold text-gray-800">
              <img src={logo} alt="Your Logo" className="h-8 w-auto" />
              HonkSpotter
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <Button variant="link">Home</Button>
            </Link>
            <Link to="/login">
              <Button variant="default">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
