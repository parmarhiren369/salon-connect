import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Trash2, Receipt, IndianRupee, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Billing = () => {
  const { billings, addBilling, deleteBilling, customers, salonServices } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: "", services: [] as string[], amount: "", date: new Date().toISOString().split("T")[0], notes: "" });

  const today = new Date();
  const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const filtered = useMemo(() => {
    return billings.filter(b => {
      const d = new Date(b.date);
      return d >= new Date(startDate) && d <= new Date(endDate + "T23:59:59");
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [billings, startDate, endDate]);

  const totalRevenue = filtered.reduce((sum, b) => sum + b.amount, 0);

  const toggleService = (name: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(name) ? prev.services.filter(s => s !== name) : [...prev.services, name],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.amount) { toast.error("Customer and amount are required"); return; }
    const customer = customers.find(c => c.id === form.customerId);
    addBilling({
      customerId: form.customerId,
      customerName: customer?.name || "Unknown",
      services: form.services,
      amount: parseFloat(form.amount),
      date: form.date,
      notes: form.notes,
    });
    toast.success("Bill added");
    setForm({ customerId: "", services: [], amount: "", date: new Date().toISOString().split("T")[0], notes: "" });
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">Track sales and revenue</p>
        </motion.div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> New Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">New Bill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Customer *</label>
                <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select customer..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.mobile}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Services</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {salonServices.map(s => (
                    <button type="button" key={s.id} onClick={() => toggleService(s.name)}
                      className={`text-xs px-3 py-1.5 rounded-full font-body transition-all ${form.services.includes(s.name) ? 'gold-gradient text-accent-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >{s.name}</button>
                  ))}
                  {salonServices.length === 0 && <p className="text-xs text-muted-foreground font-body">Add services in Services page first</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="1500" className="h-11" />
              </div>
              <div>
                <label className="form-label">Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-11" />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" className="h-11" />
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                Add Bill
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Range & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-5">
          <label className="form-label">Start Date</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11 mt-1" />
        </div>
        <div className="glass-card p-5">
          <label className="form-label">End Date</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-11 mt-1" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-sm font-body text-muted-foreground">Total Revenue</span>
          </div>
          <div className="flex items-center gap-1 text-3xl font-display font-bold text-foreground">
            <IndianRupee className="h-6 w-6" />
            {totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1">{filtered.length} bill(s) in range</p>
        </motion.div>
      </div>

      {/* Bills List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <div className="avatar-circle mx-auto mb-4 h-16 w-16">
            <Receipt className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="font-display text-xl text-foreground mb-1">No bills found</p>
          <p className="font-body text-sm text-muted-foreground">Adjust date range or create a new bill</p>
        </motion.div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-border">
            <AnimatePresence>
              {filtered.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="avatar-circle h-10 w-10 shrink-0">
                      <span className="avatar-text text-xs">{b.customerName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{b.customerName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CalendarIcon className="h-3 w-3 text-accent" />
                        <span className="text-xs text-muted-foreground font-body">{new Date(b.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      {b.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {b.services.map((s, si) => (
                            <span key={si} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body font-medium">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-foreground font-display font-bold text-lg">
                        <IndianRupee className="h-4 w-4" />
                        {b.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button onClick={() => { deleteBilling(b.id); toast.success("Bill removed"); }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
