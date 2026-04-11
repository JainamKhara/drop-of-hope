import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "@/components/NotificationCenter";
import {
  Heart,
  LogOut,
  User,
  Bell,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

const Navbar = () => {
  const {
    donorProfile,
    adminProfile,
    hospitalProfile,
    userRole,
    isSignedIn,
    clerkSignOut,
    supabaseSignOut,
    loading,
  } = useHybridAuth();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const displayName = (() => {
    if (userRole === "admin") return adminProfile?.name;
    if (userRole === "hospital") return hospitalProfile?.name;
    return donorProfile?.name || "User";
  })();

  const dashboardLink = (() => {
    if (userRole === "admin") return "/admin";
    if (userRole === "hospital") return "/hospital-portal";
    return "/dashboard";
  })();

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    if (userRole === "donor") {
      await clerkSignOut();
    } else {
      await supabaseSignOut();
      navigate("/");
    }
  };

  const navLinks = [
    { label: "About", path: "/about" },
    { label: "Find Drives", path: "/drives" },
    { label: "Community", path: "/community" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="border-b-2 border-[hsl(0,80%,50%)] bg-background dark:bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 hover:scale-105 transition-transform"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-display font-bold text-base sm:text-lg md:text-xl text-[hsl(0,80%,50%)]">
              Drop of Hope
            </span>
            {userRole === "admin" && (
              <Badge className="bg-[hsl(0,80%,50%)]/10 text-[hsl(0,80%,50%)] ml-2 border-none">
                Admin
              </Badge>
            )}
            {userRole === "hospital" && (
              <Badge className="bg-blue-100 text-blue-700 ml-2 border-none">
                Hospital
              </Badge>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-foreground font-medium text-sm uppercase hover:border-b-2 hover:border-[hsl(0,80%,50%)] pb-0.5 md:pb-1 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              corners="crisp"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="text-muted-foreground hover:text-[hsl(0,80%,50%)]"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            {isSignedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  {userRole === "donor" && <NotificationCenter />}

                  {userRole === "admin" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        corners="crisp"
                        className="text-muted-foreground hover:text-[hsl(0,80%,50%)]"
                      >
                        <Bell className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        corners="crisp"
                        className="text-muted-foreground hover:text-[hsl(0,80%,50%)]"
                      >
                        <Settings className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                </div>

                <Link
                  to={userRole === "donor" ? "/profile" : dashboardLink}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-8 h-8 border-2 border-[hsl(0,80%,50%)] rounded-full">
                    <AvatarImage
                      src={
                        userRole === "donor"
                          ? donorProfile?.profile_pic_url
                          : ""
                      }
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-[hsl(0,80%,50%)]/10 text-[hsl(0,80%,50%)]">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {displayName}
                  </span>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  corners="crisp"
                  className="hidden md:flex items-center border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" corners="crisp" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  corners="crisp"
                  size="sm"
                  asChild
                >
                  <Link to="/register">Donate Now</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              corners="crisp"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-lg font-medium text-foreground hover:text-[hsl(0,80%,50%)] uppercase transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn && (
                <Link
                  to={dashboardLink}
                  className="text-lg font-medium text-foreground hover:text-[hsl(0,80%,50%)] uppercase transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            <Separator className="bg-border" />

            {isSignedIn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-[hsl(0,80%,50%)] rounded-full">
                      <AvatarImage
                        src={
                          userRole === "donor"
                            ? donorProfile?.profile_pic_url
                            : ""
                        }
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-[hsl(0,80%,50%)]/10 text-[hsl(0,80%,50%)]">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {userRole}
                      </p>
                    </div>
                  </div>
                  {userRole === "donor" && <NotificationCenter />}
                </div>
                <Button
                  variant="outline"
                  corners="crisp"
                  className="w-full flex items-center justify-center border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)]"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  corners="crisp"
                  className="w-full"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  corners="crisp"
                  className="w-full"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/register">Donate Now</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const Separator = ({ className }: { className?: string }) => (
  <div className={`h-px w-full ${className}`} />
);

export default Navbar;
