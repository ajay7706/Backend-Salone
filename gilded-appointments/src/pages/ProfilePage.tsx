import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, phone });
      toast({ title: "Profile updated successfully!" });
    } catch (err: any) {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-center mb-8">
          My <span className="text-primary">Profile</span>
        </h1>
        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full rounded-lg bg-muted border border-border text-muted-foreground px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full gold-gradient text-primary-foreground font-semibold hover:opacity-90">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={handleLogout} className="w-full rounded-full border-primary text-primary hover:bg-primary/10">
            Logout
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
