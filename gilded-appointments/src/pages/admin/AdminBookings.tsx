import AdminBookingsPanel from "@/components/AdminBookingsPanel";

const AdminBookings = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold mb-8">Manage <span className="text-primary">Bookings</span></h1>
      <AdminBookingsPanel />
    </div>
  );
};

export default AdminBookings;
