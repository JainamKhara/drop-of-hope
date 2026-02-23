import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "@/components/NotificationCenter";
import { Heart, LogOut, User, Bell, Settings, Menu, X } from "lucide-react";

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
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="border-b bg-white/80 backdrop-blur-md dark:bg-card/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold text-hope-red">
              Drop of Hope
            </span>
            {userRole === "admin" && (
              <Badge className="bg-hope-red/10 text-hope-red ml-2 border-none">
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
                className="text-foreground hover:text-hope-red transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {isSignedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  {userRole === "donor" && <NotificationCenter />}

                  {userRole === "admin" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-hope-red"
                      >
                        <Bell className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-hope-red"
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
                  <Avatar className="w-8 h-8 border border-hope-red/20">
                    <AvatarImage
                      src={
                        userRole === "donor"
                          ? donorProfile?.profile_pic_url
                          : ""
                      }
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-hope-red/10 text-hope-red">
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
                  className="hidden md:flex items-center border-hope-red/20 text-hope-red hover:bg-hope-red hover:text-white"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  className="bg-hope-red hover:bg-hope-red/90 text-white"
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
        <div className="md:hidden border-t bg-white dark:bg-card">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-lg font-medium text-foreground hover:text-hope-red transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn && (
                <Link
                  to={dashboardLink}
                  className="text-lg font-medium text-foreground hover:text-hope-red transition-colors"
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
                    <Avatar className="w-10 h-10 border border-hope-red/20">
                      <AvatarImage
                        src={
                          userRole === "donor"
                            ? donorProfile?.profile_pic_url
                            : ""
                        }
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-hope-red/10 text-hope-red">
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
                  className="w-full flex items-center justify-center border-hope-red/20 text-hope-red"
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
                  className="w-full"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  className="w-full bg-hope-red hover:bg-hope-red/90 text-white"
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
