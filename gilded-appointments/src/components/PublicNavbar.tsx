import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const PublicNavbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <span className="text-xl font-display font-bold text-primary">LUXE SALON</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-primary ${
                pathname === l.to ? "text-primary border-b-2 border-primary pb-1" : "text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/book-appointment">
            <Button variant="default" className="rounded-full gold-gradient text-primary-foreground font-semibold px-6 hover:opacity-90">
              Book Now
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10 px-6">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="rounded-full gold-gradient text-primary-foreground font-semibold px-6 hover:opacity-90">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-primary" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm font-medium ${pathname === l.to ? "text-primary" : "text-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/book-appointment" onClick={() => setOpen(false)}>
            <Button className="w-full rounded-full gold-gradient text-primary-foreground font-semibold">Book Now</Button>
          </Link>
          <div className="flex gap-2">
            <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full rounded-full border-primary text-primary">Login</Button>
            </Link>
            <Link to="/signup" className="flex-1" onClick={() => setOpen(false)}>
              <Button className="w-full rounded-full gold-gradient text-primary-foreground">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
