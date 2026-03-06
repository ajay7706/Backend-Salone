import { motion } from "framer-motion";
import { User } from "lucide-react";

const mockUsers = [
  { id: "1", name: "John Doe", email: "user@demo.com", phone: "9876543210", role: "user" },
  { id: "2", name: "Admin", email: "admin@demo.com", phone: "9876543211", role: "admin" },
];

const AdminUsers = () => (
  <div className="container mx-auto px-4 py-16">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-display font-bold mb-8">
        Manage <span className="text-primary">Users</span>
      </h1>
      <div className="space-y-4">
        {mockUsers.map((u) => (
          <div key={u.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-foreground">{u.name}</h3>
              <p className="text-sm text-muted-foreground">{u.email} · {u.phone}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default AdminUsers;
