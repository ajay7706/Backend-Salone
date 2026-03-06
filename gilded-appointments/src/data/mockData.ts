import serviceHaircut from "@/assets/service-haircut.jpg";
import serviceBeard from "@/assets/service-beard.jpg";
import serviceFacial from "@/assets/service-facial.jpg";
import serviceColoring from "@/assets/service-coloring.jpg";
import serviceHairspa from "@/assets/service-hairspa.jpg";
import serviceHairwash from "@/assets/hero-salon.jpg"; // Updated to use an existing image as a placeholder

export interface Facility {
  title: string;
  icon: string; // lucide icon name
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  image: string;
  averageRating: number; // Changed from rating
  totalRatings: number; // Changed from reviewCount
  facilities: string[]; // Changed to string[]
  location?: {
    city?: string;
    address?: string;
  };
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: "Pending" | "Approved" | "Completed" | "Rejected";
  rated: boolean;
}

export const services: Service[] = [
  {
    id: "1",
    name: "Haircut",
    price: 20,
    duration: 30,
    image: serviceHaircut,
    averageRating: 4.5,
    totalRatings: 120,
    facilities: ["Scissors", "Shampoo", "Towel"],
    location: { city: "Lucknow", address: "Main Street" },
  },
  {
    id: "2",
    name: "Beard Trim",
    price: 15,
    duration: 20,
    image: serviceBeard,
    averageRating: 4.2,
    totalRatings: 80,
    facilities: ["Razor", "Cream", "Aftershave"],
    location: { city: "Lucknow", address: "Market Road" },
  },
  {
    id: "3",
    name: "Facial Treatment",
    price: 500,
    duration: 45,
    image: serviceFacial,
    averageRating: 4.9,
    totalRatings: 80,
    facilities: ["Skin Care", "Organic Products", "Relaxing Ambience"],
    location: { city: "Chicago", address: "789 Oak St" },
  },
  {
    id: "4",
    name: "Hair Coloring",
    price: 800,
    duration: 60,
    image: serviceColoring,
    averageRating: 4.6,
    totalRatings: 65,
    facilities: ["Premium Colors", "Expert Stylists", "Long Lasting"],
    location: { city: "Houston", address: "321 Main St" },
  },
  {
    id: "5",
    name: "Hair Spa",
    price: 600,
    duration: 50,
    image: serviceHairspa,
    averageRating: 4.8,
    totalRatings: 110,
    facilities: ["Deep Conditioning", "Scalp Massage", "Natural Oils"],
    location: { city: "Phoenix", address: "654 Main St" },
  },
  {
    id: "6",
    name: "Hair Wash",
    price: 200,
    duration: 20,
    image: serviceHairwash,
    averageRating: 4.5,
    totalRatings: 50,
    facilities: ["Gentle Shampoo", "Conditioning", "Scalp Massage"],
    location: { city: "Philadelphia", address: "987 Main St" },
  },
];

// Mutable bookings store
export let bookings: Booking[] = [
  {
    id: "b1",
    userId: "1",
    serviceId: "1",
    serviceName: "Hair Cut",
    date: "2026-02-20",
    time: "10:00 AM",
    status: "Completed",
    rated: false,
  },
  {
    id: "b2",
    userId: "1",
    serviceId: "2",
    serviceName: "Beard Trim",
    date: "2026-02-22",
    time: "2:00 PM",
    status: "Pending",
    rated: false,
  },
];

export const addBooking = (booking: Booking) => {
  bookings = [...bookings, booking];
};

export const updateBookingStatus = (id: string, status: Booking["status"]) => {
  bookings = bookings.map((b) => (b.id === id ? { ...b, status } : b));
};

export const rateBooking = (id: string) => {
  bookings = bookings.map((b) => (b.id === id ? { ...b, rated: true } : b));
};
