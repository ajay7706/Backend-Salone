import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { services as mockServices } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { request } from "@/lib/api";
import * as LucideIcons from "lucide-react";

const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon className="h-4 w-4 text-primary" /> : null;
};

type ServiceItem = {
  id: string;
  name: string;
  image?: string;
  price?: number;
  duration?: number;
  location?: { city?: string; address?: string };
  facilities?: string[]; // Added facilities field
};

const AdminServices = () => {
  const [list, setList] = useState<ServiceItem[]>(mockServices as any[]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newFacilities, setNewFacilities] = useState(""); // Added facilities state

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await request("/api/services");
        const items = Array.isArray(data) ? data : data?.services ?? [];
        if (!mounted) return;
        setList(
          items.map((s: any) => ({
            id: s.id || s._id,
            name: s.name,
            image: s.image || (mockServices[0] && (mockServices[0] as any).image),
            price: s.price,
            duration: s.duration,
            location: s.location || {},
            facilities: s.facilities || [],
          }))
        );
      } catch (err) {
        // leave mock data if backend not available
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newImage.trim()) {
        toast({ title: "Image URL is required", description: "Please provide an image URL for the service.", variant: "destructive" });
        return;
      }

      const payload: any = {
        name: newName,
        image: newImage.trim(),
        price: Number(newPrice),
        duration: Number(newDuration),
        facilities: newFacilities.split(","), // Convert facilities to array
      };
      if (newCity || newAddress) payload.location = { city: newCity, address: newAddress };
      const res = await request("/api/services", { method: "POST", body: JSON.stringify(payload) });
      const created = res.service || res;
      setList((prev) => [
        ...prev,
        {
          id: created.id || created._id || Date.now().toString(),
          name: created.name,
          image: created.image || (prev[0] && (prev[0] as any).image) || "",
          price: created.price,
          duration: created.duration,
          location: created.location || {},
          facilities: created.facilities || [],
        },
      ]);
      setNewName("");
      setNewPrice("");
      setNewDuration("");
      setNewImage("");
      setNewCity("");
      setNewAddress("");
      setNewFacilities(""); // Reset facilities
      setShowAdd(false);
      toast({ title: "Service added" });
    } catch (err: any) {
      toast({ title: "Failed to add service", description: err?.message || String(err), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await request(`/api/services/${id}`, { method: "DELETE" });
      setList((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Service deleted" });
    } catch (err: any) {
      toast({ title: "Failed to delete", description: err?.message || String(err), variant: "destructive" });
    }
  };

  const handleEdit = async (item: ServiceItem) => {
    const name = prompt("Service name:", item.name);
    if (name === null) return;
    const priceStr = prompt("Price (₹):", item.price?.toString() ?? "");
    if (priceStr === null) return;
    const durationStr = prompt("Duration (mins):", item.duration?.toString() ?? "");
    if (durationStr === null) return;
    try {
      const payload: any = { name, price: Number(priceStr), duration: Number(durationStr) };
      await request(`/api/services/${item.id}`, { method: "PUT", body: JSON.stringify(payload) });
      setList((prev) => prev.map((p) => (p.id === item.id ? { ...p, ...payload } : p)));
      toast({ title: "Service updated" });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err?.message || String(err), variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">Manage <span className="text-primary">Services</span></h1>
          <Button onClick={() => setShowAdd(!showAdd)} className="rounded-full gold-gradient text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Add Service
          </Button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" placeholder="Service Name" value={newName} onChange={(e) => setNewName(e.target.value)} required
              className="rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
            <input
              type="text"
              placeholder="Image URL"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              required
              className="rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
            <input type="number" placeholder="Price (₹)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required
              className="rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
            <input type="number" placeholder="Duration (mins)" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} required
              className="rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />

            <input type="text" placeholder="City (optional)" value={newCity} onChange={(e) => setNewCity(e.target.value)}
              className="rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
            <input type="text" placeholder="Address (optional)" value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
              className="rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
            <input type="text" placeholder="Facilities (comma-separated)" value={newFacilities} onChange={(e) => setNewFacilities(e.target.value)}
              className="rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />

            <div className="col-span-1 lg:col-span-4">
              <Button type="submit" className="rounded-lg gold-gradient text-primary-foreground hover:opacity-90">Save</Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {list.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={s.image} alt={s.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="font-display font-bold text-foreground">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">₹{s.price} · {s.duration} mins</p>
                  {s.location?.city && <p className="text-xs text-foreground/70">{s.location.city}{s.location.address ? ` • ${s.location.address}` : ""}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {s.facilities?.map((facility, index) => (
                      <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getIcon(facility)}
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => handleEdit(s)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminServices;
