import { useStore } from "@/store/useStore";
import { Users, FileText, MessageSquare, TrendingUp, ArrowUpRight, Calendar, Cake } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

const Dashboard = () => {
  const { customers, templates, appointments } = useStore();

  const thisMonth = customers.filter(c => {
    const d = new Date(c.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Get customers with birthdays in next 7 days
  const upcomingBirthdays = customers.filter(c => {
    if (!c.birthday) return false;
    
    const today = new Date();
    const birthdayDate = new Date(c.birthday);
    const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    
    // If birthday already passed this year, check next year
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  }).sort((a, b) => {
    const dateA = new Date(a.birthday!);
    const dateB = new Date(b.birthday!);
    return dateA.getTime() - dateB.getTime();
  });

  const stats = [
    { label: "Total Clients", value: customers.length, icon: Users, subtitle: "All registered" },
    { label: "Templates", value: templates.length, icon: FileText, subtitle: "Ready to send" },
    { label: "This Month", value: thisMonth, icon: TrendingUp, subtitle: "New clients" },
    { label: "Ready to Message", value: customers.filter(c => c.mobile).length, icon: MessageSquare, subtitle: "With mobile" },
  ];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWindow = new Date(startOfToday);
  endOfWindow.setDate(endOfWindow.getDate() + 7);
  endOfWindow.setHours(23, 59, 59, 999);

  const recentAppointments = appointments
    .filter((appointment) => {
      if (appointment.status !== "scheduled") return false;
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time || "00:00"}`);
      return appointmentDateTime >= startOfToday && appointmentDateTime <= endOfWindow;
    })
    .sort((a, b) => {
      const first = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const second = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return first - second;
    });

  return (
    <div>
      <div className="page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back to Life Style Studio</p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
            className="stat-card group cursor-default"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="h-12 w-12 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
            </div>
            <span className="text-4xl font-display font-bold text-foreground tracking-tight">{stat.value}</span>
            <p className="text-sm text-foreground font-body font-medium mt-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-semibold">Recent Appointments</h2>
            <p className="text-xs text-muted-foreground font-body tracking-wider mt-1">Scheduled appointments for the next 7 days</p>
          </div>
          <Calendar className="h-5 w-5 text-accent" />
        </div>
        {recentAppointments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="avatar-circle mx-auto mb-4 h-16 w-16">
              <Calendar className="h-7 w-7 text-accent-foreground" />
            </div>
            <p className="font-display text-xl text-foreground mb-1">No upcoming scheduled appointments</p>
            <p className="font-body text-sm text-muted-foreground">Only scheduled appointments in the next 7 days are shown</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentAppointments.map((appointment, i) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="avatar-circle">
                    <span className="avatar-text">{(appointment.customerName || "C").charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">{appointment.customerName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground font-body tracking-wide">{appointment.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground font-body">{formatDate(appointment.date)} {appointment.time ? `• ${appointment.time}` : ""}</span>
                  <p className="text-[10px] text-accent font-body font-medium mt-0.5 capitalize">{appointment.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card overflow-hidden mt-8"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-semibold">Upcoming Birthdays 🎉</h2>
              <p className="text-xs text-muted-foreground font-body tracking-wider mt-1">Birthdays in the next 7 days</p>
            </div>
            <Cake className="h-5 w-5 text-accent" />
          </div>
          <div className="divide-y divide-border">
            {upcomingBirthdays.map((c, i) => {
              const birthdayDate = new Date(c.birthday!);
              const today = new Date();
              const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
              if (thisYearBirthday < today) {
                thisYearBirthday.setFullYear(today.getFullYear() + 1);
              }
              const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="avatar-circle">
                      <span className="avatar-text">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground font-body tracking-wide">{c.mobile}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-body font-semibold text-accent">
                      {daysUntil === 0 ? "Today! 🎂" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                      {formatDate(thisYearBirthday)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
