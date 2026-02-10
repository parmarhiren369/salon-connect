import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Search, Plus, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Billings = () => {
  const { billings, addBilling, customers } = useStore();
  const [open, setOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });
  const [form, setForm] = useState({
    customerId: "",
    service: "",
    amount: "",
    date: new Date().toISOString().split("T")[0]
  });

  const filtered = billings.filter(b => {
    const matchesService = !serviceSearch || b.service.toLowerCase().includes(serviceSearch.toLowerCase());
    const billingDate = new Date(b.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDateRange = billingDate >= startDate && billingDate <= endDate;
    return matchesService && matchesDateRange;
  });

  const totalRevenue = filtered.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.service || !form.amount) {
      toast.error("All fields are required");
      return;
    }
    addBilling({
      customerId: form.customerId,
      service: form.service,
      amount: form.amount,
      date: form.date
    });
    toast.success("Billing added successfully");
    setForm({ customerId: "", service: "", amount: "", date: new Date().toISOString().split("T")[0] });
    setOpen(false);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Unknown";
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Billings & Services</h1>
          <p className="page-subtitle">Track services and revenue</p>
        </motion.div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Billing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">New Billing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Client *</label>
                <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Service *</label>
                <Input
                  value={form.service}
                  onChange={e => setForm({ ...form, service: e.target.value })}
                  placeholder="e.g., Haircut, Facial, Makeup"
                  className="h-11"
                />
              </div>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="h-11"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="form-label">Date *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                Add Billing
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg gold-gradient flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-3xl font-display font-bold">₹{totalRevenue.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">Total Revenue</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg gold-gradient flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-3xl font-display font-bold">{filtered.length}</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">Total Services</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg gold-gradient flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-3xl font-display font-bold">
              {filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(2) : "0.00"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-body">Avg. per Service</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="form-label text-xs">Date Range</label>
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="h-10 text-sm"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="form-label text-xs">Search by Service</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                placeholder="Search services..."
                className="pl-10 h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billings Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-body text-sm font-semibold">Date</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Client</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Service</th>
                <th className="text-right p-4 font-body text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl gold-gradient/10 flex items-center justify-center">
                        <DollarSign className="h-8 w-8 text-accent" />
                      </div>
                      <p className="font-display text-xl text-foreground">No billings found</p>
                      <p className="text-sm text-muted-foreground">Add your first billing to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-body text-sm text-muted-foreground">
                      {new Date(b.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-body text-sm font-medium">{getCustomerName(b.customerId)}</td>
                    <td className="p-4 font-body text-sm">{b.service}</td>
                    <td className="p-4 font-body text-sm font-semibold text-right">₹{parseFloat(b.amount).toFixed(2)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billings;
