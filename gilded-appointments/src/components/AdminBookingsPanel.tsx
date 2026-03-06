import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  userId?: { name: string; email: string; phone: string };
  serviceName: string;
  date: string;
  time: string;
  status: string;
  servicePrice: number;
}

const AdminBookingsPanel = ({ onChange }: { onChange?: (bookings: Booking[]) => void }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pending");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await request("/api/bookings/admin/all", {
        method: "GET",
      });
      setBookings(data);
      // notify parent about updated bookings so counts/stats can refresh
      if (onChange) onChange(data);
    } catch (err: any) {
      toast({
        title: "Error fetching bookings",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    setActionBookingId(bookingId);
    try {
      await request(`/api/bookings/${bookingId}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes: "" }),
      });
      toast({
        title: "Booking approved!",
        description: "PDF receipt sent to user via email and WhatsApp.",
      });
      fetchBookings();
    } catch (err: any) {
      toast({
        title: "Error approving booking",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionBookingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setActionBookingId(bookingId);
    try {
      await request(`/api/bookings/${bookingId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      toast({
        title: "Booking rejected",
        description: "User has been notified.",
      });
      fetchBookings();
    } catch (err: any) {
      toast({
        title: "Error rejecting booking",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionBookingId(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setActionBookingId(bookingId);
    try {
      await request(`/api/bookings/${bookingId}/complete`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast({
        title: "Booking completed!",
        description: "User notified to rate their experience.",
      });
      fetchBookings();
    } catch (err: any) {
      toast({
        title: "Error completing booking",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionBookingId(null);
    }
  };

  const tabs = [
    { label: "Pending", value: "Pending", icon: Clock },
    { label: "Approved", value: "Approved", icon: CheckCircle },
    { label: "Completed", value: "Completed", icon: Package },
    { label: "Rejected", value: "Rejected", icon: XCircle },
  ];

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? "gold-gradient text-white"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            <tab.icon className="w-4 h-4 inline mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-xl border border-border">
          <p className="text-muted-foreground">No {activeTab.toLowerCase()} bookings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {booking.userId?.name || "User"}
                </p>
                <h3 className="font-semibold text-foreground">{booking.serviceName}</h3>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm">
                <p className="text-muted-foreground">
                  📅 {new Date(booking.date).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">⏰ {booking.time}</p>
                <p className="font-semibold text-primary">
                  Rs. {booking.servicePrice}
                </p>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : booking.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {booking.status === "Pending" && (
                  <>
                    <Button
                      onClick={() => handleApprove(booking._id)}
                      disabled={actionBookingId === booking._id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      {actionBookingId === booking._id ? "..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleReject(booking._id)}
                      disabled={actionBookingId === booking._id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      {actionBookingId === booking._id ? "..." : "Reject"}
                    </Button>
                  </>
                )}

                {booking.status === "Approved" && (
                  <Button
                    onClick={() => handleComplete(booking._id)}
                    disabled={actionBookingId === booking._id}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    {actionBookingId === booking._id ? "..." : "Mark Complete"}
                  </Button>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <p>📧 {booking.userId?.email}</p>
                <p>📱 {booking.userId?.phone}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPanel;
