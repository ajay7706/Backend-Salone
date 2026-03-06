import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    facilities: "",
    image: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...newService,
        facilities: newService.facilities.split(","), // Convert facilities to array
      };
      await request("/api/services", {
        method: "POST",
        body: JSON.stringify(serviceData),
      });
      toast({ title: "Service added successfully!" });
      setNewService({ name: "", price: "", duration: "", facilities: "", image: "" });
    } catch (err: any) {
      toast({ title: "Error adding service", description: err?.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      <form onSubmit={handleAddService} className="space-y-6 bg-card border border-border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Service Name</label>
          <input
            type="text"
            name="name"
            value={newService.name}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter service name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Price (₹)</label>
          <input
            type="number"
            name="price"
            value={newService.price}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter price"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Duration (mins)</label>
          <input
            type="number"
            name="duration"
            value={newService.duration}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter duration"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Facilities (comma-separated)</label>
          <textarea
            name="facilities"
            value={newService.facilities}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter facilities, separated by commas"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Image URL</label>
          <input
            type="text"
            name="image"
            value={newService.image}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter image URL"
          />
        </div>
      </form>
    </div>
  );
};

export default AdminDashboard;