import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { request } from "@/lib/api";
import { services as mockServices } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
// import { request } from "@/lib/api";

const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState("");
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // preselect if navigated with state { serviceId }
    if ((location as any).state?.serviceId) {
      setServiceId((location as any).state.serviceId);
    }
  }, [location]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await request("/api/services");
        const list = Array.isArray(data) ? data : data?.services ?? [];
        if (!mounted) return;
        setAvailableServices(list.map((s: any) => ({ id: s.id || s._id, name: s.name, price: s.price, duration: s.duration })));
      } catch (err) {
        // fallback to mock services
        setAvailableServices(mockServices.map((m) => ({ id: m.id, name: m.name, price: m.price, duration: m.duration })));
      }
    })();
    return () => { mounted = false; };
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !date || !time) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    const service = availableServices.find((s) => s.id === serviceId) || mockServices.find((s) => s.id === serviceId);
    setLoading(true);
    try {
      await request("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          serviceName: service!.name,
          servicePrice: service!.price,
          date,
          time,
        }),
      });
      toast({ title: "Booking confirmed!", description: "Your appointment has been submitted for admin approval." });
      navigate("/my-bookings");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-center mb-8">
          Book <span className="text-primary">Appointment</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Choose a service</option>
              {availableServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - ₹{s.price} ({s.duration} mins)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Time Slot</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    time === t
                      ? "gold-gradient text-primary-foreground border-primary"
                      : "bg-secondary border-border text-foreground hover:border-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full gold-gradient text-primary-foreground font-semibold py-6 text-lg hover:opacity-90">
            {loading ? "Confirming..." : "Confirm Booking"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default BookAppointment;
