import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  House,
  CalendarClock,
  BookOpen,
  UsersRound,
  ChevronDown,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import avatar1 from "../../assets/Avatar-1.png";
import { Button } from "@/components/ui/button";
import { APIURL } from "@/url.config";
import wavyylogo from "../../assets/wavyylogo.png";
import { BarLoader } from "react-spinners";

export function Navbar() {
  const businessId = localStorage.getItem("businessId");
  const [isLoggedIn, setIsLoggedIn] = useState(!!businessId);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessData, setBusinessData] = useState({
    businessName: "",
    ownerName: "",
    profileImage: avatar1,
  });

  const url = `${APIURL}/api/business/${businessId}/`;

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setBusinessData({
            businessName: data.salon_name,
            ownerName: data.owner_name,
            profileImage: data.profile_img || avatar1,
          });
        } else {
          console.error("Failed to fetch business info");
        }
      } catch (error) {
        console.error("Error fetching business info:", error);
      } finally{
        setLoading(false);
      }
    };
    fetchBusinessInfo();
  }, [url]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("businessId"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("businessId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  if (!isLoggedIn) return null;

  return (
    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-xl font-semibold">
        <img src={wavyylogo} width={70} />
      </div>

      {/* Desktop Nav */}
      <div className="hidden sm:flex justify-center space-x-4">
        <NavLink to="/dashboard" className="button-nav ">
          <Button variant="ghost">
            <House stroke="purple" size={24} /> Home
          </Button>
        </NavLink>
        <NavLink to="/calendar" className="button-nav">
          <Button variant="ghost">
            <CalendarClock stroke="purple" size={24} /> Calendar
          </Button>
        </NavLink>
        <NavLink to="/services" className="button-nav">
          <Button variant="ghost">
            <ShoppingBag stroke="purple" size={24} /> Services
          </Button>
        </NavLink>
        <NavLink to="/bookings" className="button-nav">
          <Button variant="ghost">
            <BookOpen stroke="purple" size={24} /> Bookings
          </Button>
        </NavLink>
        <NavLink to="/manage-team" className="button-nav">
          <Button variant="ghost">
            <UsersRound stroke="purple" size={24} /> My Team
          </Button>
        </NavLink>
      </div>

      {/* Avatar and Dropdown */}
      
      <div className="hidden sm:flex items-center space-x-2">
      {loading ? (
            <div className="text-center py-10">
             <BarLoader color="#CF9FFF" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer space-x-2">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={businessData.profileImage}
                  alt={businessData.ownerName}
                  
                />
              </Avatar>
              <span className="text-sm font-medium text-black">{businessData.ownerName}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white shadow-md">
            <DropdownMenuItem>
              <NavLink to="/profile" className="w-full text-left">
                My Profile
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button onClick={handleLogout} className="w-full text-left">
                Logout
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}
      </div>
      
      {/* Mobile Menu Button */}
      <button className="sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 w-full bg-white shadow-md p-4">
          <div className="flex flex-col space-y-2">
            <NavLink
              to="/dashboard"
              className="button-nav"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button variant="ghost">
                <House stroke="purple" size={24} /> Home
              </Button>
            </NavLink>
            <NavLink
              to="/calendar"
              className="button-nav"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button variant="ghost">
                <CalendarClock stroke="purple" size={24} /> Calendar
              </Button>
            </NavLink>
            <NavLink
              to="/services"
              className="button-nav"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button variant="ghost">
                <ShoppingBag stroke="purple" size={24} /> Services
              </Button>
            </NavLink>
            <NavLink
              to="/bookings"
              className="button-nav"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button variant="ghost">
                <BookOpen stroke="purple" size={24} /> Bookings
              </Button>
            </NavLink>
            <NavLink
              to="/manage-team"
              className="button-nav"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button variant="ghost">
                <UsersRound stroke="purple" size={24} /> My Team
              </Button>
            </NavLink>
            {/* Profile & Logout in Mobile View */}
            <div className="border-t mt-2 pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer space-x-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={businessData.profileImage}
                        alt={businessData.ownerName}
                      />
                    </Avatar>
                    <span className="text-sm font-medium">
                      {businessData.ownerName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white shadow-md">
                  <DropdownMenuItem>
                    <NavLink to="/profile" className="w-full text-left">
                      My Profile
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button onClick={handleLogout} className="w-full text-left">
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
