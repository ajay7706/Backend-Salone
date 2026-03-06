import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Mail } from "lucide-react";

const AboutPage = () => (
  <div className="container mx-auto px-4 py-16">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
        About <span className="text-primary italic">Luxe Salon</span>
      </h1>
      <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed">
        At Luxe Salon, we believe that grooming is an art form. Our team of expert stylists combines years of experience
        with the latest techniques to deliver a premium experience every time you visit.
      </p>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {[
        { icon: Clock, title: "Working Hours", desc: "Mon - Sun | 10 AM - 9 PM" },
          { icon: MapPin, title: "Location", desc: "Main Street, Lucknow" },
        { icon: Phone, title: "Phone", desc: "+91 1234567890" },
        { icon: Mail, title: "Email", desc: "info@luxesalon.com" },
      ].map((item, i) => (
        <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          {item.title === 'Location' ? (
            <a href="/services?city=Lucknow" className="flex items-center gap-4 no-underline w-full">
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            </a>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            </>
          )}
          
        </motion.div>
      ))}
    </div>
  </div>
);

export default AboutPage;
