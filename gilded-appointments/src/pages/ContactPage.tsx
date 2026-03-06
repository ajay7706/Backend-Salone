import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Phone, MapPin, Mail } from "lucide-react";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Contact <span className="text-primary italic">Us</span>
        </h1>
      </motion.div>
      {/* Two-column layout like the reference image:
          Left: form, Right: contact details + map stacked */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left column: Contact form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5 bg-card border gold-border rounded-xl p-6 shadow-lg shadow-black/60"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              className="w-full min-h-[160px] rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full gold-gradient text-primary-foreground font-semibold hover:opacity-90 mt-4"
          >
            Send Message
          </Button>
        </motion.form>

        {/* Right column: Contact details on top, map below (same card background) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border gold-border rounded-xl p-6 shadow-lg shadow-black/60 flex flex-col gap-6 h-full"
        >
          {/* Contact details bar */}
          <div className="space-y-4">
            {[
              { icon: Phone, title: "Phone", desc: "+91 1234567890" },
              { icon: Mail, title: "Email", desc: "info@luxesalon.com" },
              { icon: MapPin, title: "Address", desc: "Main Street, Mumbai, India" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map, aligned below contact details */}
          <div className="flex-1 flex">
            <div className="w-full rounded-2xl overflow-hidden border gold-border shadow-2xl shadow-black/70">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.998835432123!2d80.9461593150439!3d26.84670898315788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd1c1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sLucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1612345678901!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 220 }}
                allowFullScreen
                loading="lazy"
                title="Lucknow Location"
              ></iframe>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
