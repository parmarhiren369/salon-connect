import { useStore } from "@/store/useStore";
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { customers, templates } = useStore();

  const stats = [
    { label: "Total Clients", value: customers.length, icon: Users, color: "text-gold" },
    { label: "Templates", value: templates.length, icon: FileText, color: "text-gold" },
    { label: "This Month", value: customers.filter(c => { const d = new Date(c.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length, icon: TrendingUp, color: "text-gold" },
    { label: "Ready to Message", value: customers.filter(c => c.mobile).length, icon: MessageSquare, color: "text-gold" },
  ];

  const recentCustomers = [...customers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-body text-sm tracking-wide">Welcome back to Life Style Studio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <span className="text-3xl font-display font-bold text-foreground">{stat.value}</span>
            </div>
            <p className="text-sm text-muted-foreground font-body tracking-wide">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-display font-semibold">Recent Clients</h2>
        </div>
        {recentCustomers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 text-gold opacity-50" />
            <p className="font-body">No clients yet. Add your first client!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentCustomers.map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-display font-semibold text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-body font-medium text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.mobile}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground font-body">{new Date(c.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
