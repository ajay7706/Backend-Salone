import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-salon.jpg";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(isAuthenticated ? "/book-appointment" : "/signup");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Luxury salon interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Style That{" "}
              <span className="text-primary italic">Defines You</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 font-body">
              Experience premium grooming services in a luxurious environment. Your style, our expertise.
            </p>
            <Button
              onClick={handleBook}
              className="rounded-full gold-gradient text-primary-foreground font-semibold px-8 py-6 text-lg hover:opacity-90 transition-opacity"
            >
              Book Appointment <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-card border-t border-b border-border">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Call Us</p>
              <p className="font-semibold text-foreground">+91 1234567890</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex items-center gap-4">
            <Link to="/services?city=Lucknow" className="flex items-center gap-4 no-underline">
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground">Main Street, Lucknow</p>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Working Hours</p>
              <p className="font-semibold text-foreground">Mon - Sun | 10 AM - 9 PM</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Preview */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-display font-bold mb-4">
            About <span className="text-primary">Us</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            We provide premium haircuts and grooming services in a clean and professional environment.
            Our expert stylists are dedicated to making you look and feel your best with personalized attention and luxury care.
          </p>
          <Link to="/services" className="inline-block mt-8">
            <Button className="rounded-full gold-gradient text-primary-foreground font-semibold px-8 hover:opacity-90">
              View Our Services
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
