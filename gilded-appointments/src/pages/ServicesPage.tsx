import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { request } from "@/lib/api";
import { services as mockServices } from "@/data/mockData";
import serviceHaircut from "@/assets/service-haircut.jpg";
import serviceBeard from "@/assets/service-beard.jpg";
import serviceFacial from "@/assets/service-facial.jpg";
import serviceColoring from "@/assets/service-coloring.jpg";
import serviceHairspa from "@/assets/service-hairspa.jpg";
import * as LucideIcons from "lucide-react";
import { toast } from "@/hooks/use-toast"; // Import toast function

const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon className="h-4 w-4 text-primary" /> : null;
};

const getFacilityIcon = (name: string) => {
  const lower = name.toLowerCase();

  if (lower.includes("professional")) return "✂️";
  if (lower.includes("quick")) return "⏱️";
  if (
    lower.includes("clean") ||
    lower.includes("hygienic") ||
    lower.includes("sanitized")
  )
    return "🛡️";
  if (lower.includes("expert")) return "⭐";
  if (lower.includes("oil")) return "🧴";
  if (lower.includes("organic")) return "🌿";
  if (lower.includes("relax")) return "🕯️";
  if (lower.includes("skin")) return "🙂";

  return "✔️";
};

interface ServiceItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  duration: number;
  averageRating?: number; // Marked as optional
  totalRatings?: number; // Marked as optional
  location?: { city?: string; address?: string };
  facilities?: string[]; // Added facilities as a string array
  likesCount?: number;
  liked?: boolean;
}

const ServicesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>(
    mockServices.map((m) => ({
      id: m.id,
      name: m.name,
      image: m.image,
      price: m.price,
      duration: m.duration,
      averageRating: m.averageRating || 0, // Default to 0 if undefined
      totalRatings: m.totalRatings || 0, // Default to 0 if undefined
      location: m.location,
      facilities: m.facilities || [], // Default to empty array if undefined
      likesCount: (m as any).likesCount || 0,
      liked: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    name: "",
    image: "",
    price: 0,
    duration: 0,
    facilities: "",
  });

  // parse city filter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    setFilterCity(city);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchServices = async () => {
      setLoading(true);
      try {
        console.log("[Services] Fetching services from", "/api/services");
        const data = await request("/api/services");
        if (!mounted) return;
        const list = Array.isArray((data as any)?.services)
          ? (data as any).services
          : Array.isArray(data)
          ? (data as any)
          : [];
        console.log("[Services] Raw response:", data);
        console.log("[Services] Normalized list length:", list.length);
        setServices(
          list.map((s: any) => {
            const fallback = mockServices.find((m) => m.name === s.name);

            // 1) If admin has provided an image URL, always use it.
            let image: string | undefined =
              typeof s.image === "string" && s.image.trim().length > 0
                ? s.image.trim()
                : undefined;

            // 2) If no image from backend, choose a default by service name.
            if (!image) {
              const nameLower = (s.name || "").toLowerCase();

              if (
                nameLower.includes("haircut") ||
                nameLower.includes("hair cut")
              ) {
                image = serviceHaircut;
              } else if (nameLower.includes("beard")) {
                image = serviceBeard;
              } else if (nameLower.includes("facial")) {
                image = serviceFacial;
              } else if (nameLower.includes("color")) {
                image = serviceColoring;
              } else if (nameLower.includes("spa")) {
                image = serviceHairspa;
              } else if (fallback?.image) {
                image = fallback.image;
              } else {
                image = "/assets/placeholder-service.jpg";
              }
            }

            let facilitiesSource = s.facilities ?? fallback?.facilities ?? [];
            let facilities: string[] = [];

            if (Array.isArray(facilitiesSource)) {
              facilities = facilitiesSource.map((f) => (typeof f === "string" ? f.trim() : String(f))).filter(Boolean);
            } else if (typeof facilitiesSource === "string") {
              facilities = facilitiesSource
                .split(",")
                .map((f) => f.trim())
                .filter(Boolean);
            }

            return {
              id: s.id || s._id,
              name: s.name,
              image,
              price: s.price,
              duration: s.duration,
              averageRating: s.averageRating ?? 0,
              totalRatings: s.totalRatings ?? 0,
              location: s.location || {},
              facilities,
              likesCount: s.likesCount ?? 0,
              liked: false,
            } as ServiceItem & { facilities?: any };
          })
        );
      } catch (err) {
        console.error("[Services] Failed to fetch services:", err);
        setServices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial fetch and refetch when auth state changes (token may be required by backend)
    fetchServices();

    // listen for rating updates from RatingComponent
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const serviceId = detail?.serviceId;
      const newRating = detail?.rating;

      if (serviceId && typeof newRating === "number") {
        setServices((prev) =>
          prev.map((service) => {
            if (service.id === serviceId) {
              const newReviewCount = service.totalRatings + 1;
              const newAverageRating =
                (service.averageRating * service.totalRatings + newRating) /
                newReviewCount;

              return {
                ...service,
                averageRating: parseFloat(newAverageRating.toFixed(1)),
                totalRatings: newReviewCount,
              };
            }
            return service;
          })
        );
      }
    };
    window.addEventListener("ratings:updated", handler);

    return () => {
      mounted = false;
      window.removeEventListener("ratings:updated", handler);
    };
  }, [isAuthenticated]);

  const handleBook = () => {
    navigate(isAuthenticated ? "/book-appointment" : "/login");
  };

  const handleLike = async (serviceId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const data = await request(`/api/services/${serviceId}/like`, {
        method: "POST",
      });
      const { likesCount, liked } = data as { likesCount: number; liked: boolean };
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId
            ? { ...service, likesCount, liked }
            : service
        )
      );
    } catch (err: any) {
      toast({
        title: "Error updating like",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  };

  const handleAddService = async () => {
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
      setNewService({ name: "", image: "", price: 0, duration: 0, facilities: "" });
    } catch (err: any) {
      toast({ title: "Error adding service", description: err?.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold italic text-primary mb-3">Our Services</h1>
        <p className="text-muted-foreground">Choose from our range of salon services</p>
      </motion.div>

      {loading ? (
        <div className="w-full text-center py-12 text-foreground/70">Loading services…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services
            // Temporarily disable city filter to avoid hiding all items when query param is present
            .map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/50 transition-transform group"
            >
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold text-foreground text-center mb-4">{service.name}</h3>

                <div className="overflow-hidden rounded-lg mb-4">
                  <img
                    src={(service as any).image}
                    alt={service.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between text-lg mb-4">
                  <span className="text-2xl font-bold text-primary">₹{service.price}</span>
                  <span className="text-muted-foreground">{service.duration} mins</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="text-gold flex items-center gap-2">
                    {getIcon("Heart")}
                    <span className="text-lg font-semibold text-foreground/90">
                      {service.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarRating rating={service.averageRating} count={undefined} />
                    <span className="text-sm text-foreground/70">
                      ({service.totalRatings} Reviews)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLike(service.id)}
                    className="ml-auto flex items-center gap-1 text-sm focus:outline-none"
                  >
                    <span
                      className={
                        service.liked
                          ? "text-yellow-400"
                          : "text-foreground/70"
                      }
                    >
                      ❤️
                    </span>
                    <span className="text-foreground/80">
                      {service.likesCount ?? 0}
                    </span>
                  </button>
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  {service.facilities?.map((facility, index) => (
                    <div key={index}>
                      {index > 0 && (
                        <div className="border-t border-border my-2" />
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getFacilityIcon(facility)}</span>
                        <span>{facility}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {service.location?.city || service.location?.address ? (
                  <div className="text-sm text-foreground/80 mb-4">
                    <div className="font-medium text-foreground/90">Location</div>
                    <div className="text-foreground/70">
                      {service.location?.city ? `${service.location.city}` : ""}
                      {service.location?.city && service.location?.address ? " • " : ""}
                      {service.location?.address ?? ""}
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto">
                  <Button
                    onClick={handleBook}
                    className="w-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 text-lg hover:opacity-90"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
  </div>
  );  
};
  // Ensure proper JSX structure
export default ServicesPage;
