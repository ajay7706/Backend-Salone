import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(identifier, password);
      toast({ title: "Welcome back!" });
      // Will redirect in the useEffect above based on role
    } catch (err: any) {
      const message = err?.message || "Invalid credentials";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-center mb-8">
          Welcome <span className="text-primary">Back</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email or Phone</label>
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="Email or Phone Number"
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="password"
              className="w-full rounded-lg bg-input border border-border text-foreground px-4 py-3 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground" />
          </div>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline block text-right">Forgot Password?</Link>
          <Button type="submit" disabled={loading} className="w-full rounded-full gold-gradient text-primary-foreground font-semibold py-6 text-lg hover:opacity-90">
            {loading ? "Logging in..." : "Login"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
          </p>
          {/* you can remove this section once you have your own backend users */}
          <div className="mt-4 p-3 rounded-lg bg-secondary border border-border text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Tip:</p>
            <p>Sign up with any email/phone to create an account backed by the API.</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
