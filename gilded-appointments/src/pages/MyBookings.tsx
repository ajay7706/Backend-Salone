import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Clock, Star, Trash2 } from "lucide-react";
import { request } from "@/lib/api";
import RatingComponent from "@/components/RatingComponent";

interface Booking {
  _id: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Approved: "bg-blue-100 text-blue-700 border border-blue-200",
  Completed: "bg-green-100 text-green-700 border border-green-200",
  Rejected: "bg-red-100 text-red-700 border border-red-200",
  Cancelled: "bg-gray-100 text-gray-700 border border-gray-200",
};

const statusIcons: Record<string, string> = {
  Pending: "⏳",
  Approved: "✅",
  Completed: "🎉",
  Rejected: "❌",
  Cancelled: "🚫",
};

const MyBookings = () => {
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await request("/api/bookings");
      setUserBookings(data || []);
    } catch (err: any) {
      toast({
        title: "Failed to load bookings",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancelling(bookingId);
    try {
      await request(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      fetchBookings();
    } catch (err: any) {
      toast({
        title: "Error cancelling booking",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setCancelling(null);
    }
  };

  const handleRatingSubmit = () => {
    setRatingBookingId(null);
    fetchBookings();
  };

  const ratingBooking = ratingBookingId
    ? userBookings.find((b) => b._id === ratingBookingId)
    : undefined;

  if (ratingBookingId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <button
          onClick={() => setRatingBookingId(null)}
          className="text-primary hover:underline mb-4"
        >
          ← Back to Bookings
        </button>
        {ratingBooking && (
          <div className="mb-6 bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">
                  {ratingBooking.serviceName}
                </h2>
                <p className="text-sm text-primary font-semibold mt-1">
                  Rs. {ratingBooking.servicePrice}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  statusColors[ratingBooking.status]
                }`}
              >
                {statusIcons[ratingBooking.status]} {ratingBooking.status}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {new Date(ratingBooking.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {ratingBooking.time}
              </span>
            </div>
          </div>
        )}
        <RatingComponent
          bookingId={ratingBookingId}
          onRatingSubmit={handleRatingSubmit}
          serviceId={ratingBooking?.serviceId}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-center mb-2">
          My <span className="text-primary">Bookings</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Track and manage your appointments
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : userBookings.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">No bookings yet.</p>
            <a
              href="/book-appointment"
              className="inline-block px-6 py-2 gold-gradient text-white rounded-full font-medium"
            >
              Book Now
            </a>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {userBookings.map((booking, idx) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {booking.serviceName}
                    </h3>
                    <p className="text-sm text-primary font-semibold mt-1">
                      Rs. {booking.servicePrice}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      statusColors[booking.status]
                    }`}
                  >
                    {statusIcons[booking.status]} {booking.status}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(booking.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {booking.time}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {booking.status === "Completed" && (
                    <Button
                      onClick={() => setRatingBookingId(booking._id)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate Experience
                    </Button>
                  )}

                  {["Pending", "Approved"].includes(booking.status) && (
                    <Button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelling === booking._id}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {cancelling === booking._id ? "Cancelling..." : "Cancel"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyBookings;
