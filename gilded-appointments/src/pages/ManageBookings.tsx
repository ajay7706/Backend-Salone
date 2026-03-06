import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";

const ManageBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await request("/api/bookings");
        setBookings(Array.isArray(data) ? data : data?.bookings ?? []);
      } catch (err) {
        toast({ title: "Error fetching bookings", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await request(`/api/bookings/${id}/approve`, { method: "POST" });
      toast({ title: "Booking approved successfully!" });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      toast({ title: "Error approving booking", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request(`/api/bookings/${id}`, { method: "DELETE" });
      toast({ title: "Booking deleted successfully!" });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      toast({ title: "Error deleting booking", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Bookings</h1>
      {loading ? (
        <div className="text-center py-12">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">No bookings available.</div>
      ) : (
        <table className="w-full border border-border rounded-lg overflow-hidden">
          <thead className="bg-secondary text-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-border">
                <td className="px-4 py-2">{booking.serviceName}</td>
                <td className="px-4 py-2">{booking.date}</td>
                <td className="px-4 py-2">{booking.time}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    onClick={() => handleApprove(booking.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleDelete(booking.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageBookings;