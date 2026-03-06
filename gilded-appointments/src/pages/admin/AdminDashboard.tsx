import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Scissors, Users, Clock, TrendingUp } from "lucide-react";
import { request } from "@/lib/api";
import AdminBookingsPanel from "@/components/AdminBookingsPanel";
import { toast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  date: string;
  status: string;
}

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    approvedBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    dailyAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await request("/api/bookings/admin/all", {
        method: "GET",
      });
      setBookings(data);

      const today = new Date().toISOString().split("T")[0];
      setStats({
        totalBookings: data.length,
        approvedBookings: data.filter(
          (b: Booking) => b.status === "Approved"
        ).length,
        pendingBookings: data.filter((b: Booking) => b.status === "Pending")
          .length,
        todayBookings: data.filter((b: Booking) => b.date === today).length,
        dailyAmount: data
          .filter((b: Booking) => b.date === today && (b.status === "Approved" || b.status === "Completed"))
          .reduce((sum: number, b: any) => sum + (b.servicePrice || 0), 0),
      });
    } catch (err: any) {
      toast({
        title: "Error loading dashboard",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dashStats = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarDays,
      color: "from-blue-600 to-blue-400",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingBookings,
      icon: Clock,
      color: "from-yellow-600 to-yellow-400",
    },
    {
      label: "Approved",
      value: stats.approvedBookings,
      icon: TrendingUp,
      color: "from-green-600 to-green-400",
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      icon: Scissors,
      color: "from-purple-600 to-purple-400",
    },
    {
      label: "Today's Revenue",
      value: `₹${stats.dailyAmount}`,
      icon: TrendingUp,
      color: "from-indigo-600 to-indigo-400",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Manage bookings and track salon operations</p>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {dashStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${s.color} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold">{s.value}</span>
                </div>
                <p className="text-sm font-medium opacity-90">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bookings Panel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            📋 Manage Bookings
          </h2>
          <AdminBookingsPanel onChange={fetchData} />
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
