import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Trash2, Crown, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Memberships = () => {
  const { memberships, addMembership, deleteMembership, updateMembership, customers } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: "", plan: "", startDate: new Date().toISOString().split("T")[0], endDate: "", amount: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.plan || !form.endDate || !form.amount) { toast.error("All fields are required"); return; }
    const customer = customers.find(c => c.id === form.customerId);
    const isExpired = new Date(form.endDate) < new Date();
    addMembership({
      customerId: form.customerId,
      customerName: customer?.name || "Unknown",
      plan: form.plan,
      startDate: form.startDate,
      endDate: form.endDate,
      amount: parseFloat(form.amount),
      status: isExpired ? 'expired' : 'active',
    });
    toast.success("Membership added");
    setForm({ customerId: "", plan: "", startDate: new Date().toISOString().split("T")[0], endDate: "", amount: "" });
    setOpen(false);
  };

  const active = memberships.filter(m => m.status === 'active' || new Date(m.endDate) >= new Date());
  const expired = memberships.filter(m => m.status === 'expired' && new Date(m.endDate) < new Date());

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Memberships</h1>
          <p className="page-subtitle">{memberships.length} total memberships</p>
        </motion.div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Membership
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">New Membership</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Customer *</label>
                <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select customer..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Plan Name *</label>
                <Input value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} placeholder="Gold, Platinum..." className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Start Date</label>
                  <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="h-11" />
                </div>
                <div>
                  <label className="form-label">End Date *</label>
                  <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="h-11" />
                </div>
              </div>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="5000" className="h-11" />
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                Add Membership
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {memberships.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <div className="avatar-circle mx-auto mb-4 h-16 w-16">
            <Crown className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="font-display text-xl text-foreground mb-1">No memberships yet</p>
          <p className="font-body text-sm text-muted-foreground">Create membership plans for your loyal clients</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" /> Active ({active.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {active.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
                      className="glass-card-hover p-5 group border-l-4 border-l-green-500/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-body font-semibold text-foreground text-sm">{m.customerName}</h3>
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full gold-gradient text-accent-foreground font-body font-medium">{m.plan}</span>
                        </div>
                        <span className="text-lg font-display font-bold text-foreground">₹{m.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {new Date(m.startDate).toLocaleDateString('en-IN')}</span>
                        <span>→</span>
                        <span>{new Date(m.endDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { deleteMembership(m.id); toast.success("Membership removed"); }}
                          className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {expired.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Expired ({expired.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {expired.map((m, i) => (
                  <div key={m.id} className="glass-card p-5 opacity-60 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-body font-semibold text-foreground text-sm">{m.customerName}</h3>
                        <span className="text-xs text-muted-foreground font-body">{m.plan}</span>
                      </div>
                      <span className="text-lg font-display font-bold text-muted-foreground">₹{m.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
                      <span>{new Date(m.startDate).toLocaleDateString('en-IN')}</span>
                      <span>→</span>
                      <span>{new Date(m.endDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Memberships;
