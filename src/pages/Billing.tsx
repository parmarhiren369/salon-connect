import { useState, useMemo } from "react";
import { useStore, Billing as BillingType } from "@/store/useStore";
import { Plus, Trash2, Receipt, IndianRupee, TrendingUp, Calendar as CalendarIcon, Search, Edit2, Send, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Billing = () => {
  const { billings, addBilling, deleteBilling, updateBilling, customers, salonServices } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    customerId: "", services: [] as string[], amount: "", discount: "0",
    date: new Date().toISOString().split("T")[0], notes: ""
  });

  const today = new Date();
  const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const filtered = useMemo(() => {
    return billings.filter(b => {
      const d = new Date(b.date);
      const inRange = d >= new Date(startDate) && d <= new Date(endDate + "T23:59:59");
      const matchesSearch = !search || b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        customers.find(c => c.id === b.customerId)?.mobile.includes(search);
      return inRange && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [billings, startDate, endDate, search, customers]);

  const totalRevenue = filtered.reduce((sum, b) => sum + (b.finalAmount ?? b.amount), 0);

  const calcFinal = (amt: string, disc: string) => {
    const a = parseFloat(amt) || 0;
    const d = parseFloat(disc) || 0;
    return Math.round(a - (a * d / 100));
  };

  const toggleService = (name: string) => {
    setForm(prev => {
      const services = prev.services.includes(name) ? prev.services.filter(s => s !== name) : [...prev.services, name];
      const totalAmt = salonServices.filter(s => services.includes(s.name)).reduce((sum, s) => sum + s.price, 0);
      return { ...prev, services, amount: totalAmt > 0 ? totalAmt.toString() : prev.amount };
    });
  };

  const resetForm = () => {
    setForm({ customerId: "", services: [], amount: "", discount: "0", date: new Date().toISOString().split("T")[0], notes: "" });
    setEditId(null);
  };

  const startEdit = (b: BillingType) => {
    setForm({
      customerId: b.customerId,
      services: b.services,
      amount: b.amount.toString(),
      discount: (b.discount ?? 0).toString(),
      date: b.date,
      notes: b.notes || ""
    });
    setEditId(b.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.amount) { toast.error("Customer and amount are required"); return; }
    const customer = customers.find(c => c.id === form.customerId);
    const amount = parseFloat(form.amount);
    const discount = parseFloat(form.discount) || 0;
    const finalAmount = calcFinal(form.amount, form.discount);
    const data = {
      customerId: form.customerId,
      customerName: customer?.name || "Unknown",
      services: form.services,
      amount, discount, finalAmount,
      date: form.date,
      notes: form.notes,
    };
    if (editId) {
      updateBilling(editId, data);
      toast.success("Bill updated");
    } else {
      addBilling(data);
      toast.success("Bill added");
    }
    resetForm();
    setOpen(false);
  };

  const sendBillToWhatsApp = (b: BillingType) => {
    const customer = customers.find(c => c.id === b.customerId);
    if (!customer) { toast.error("Customer not found"); return; }
    const phone = customer.mobile.replace(/[^0-9]/g, "");
    const servicesText = b.services.length > 0 ? `\nServices: ${b.services.join(", ")}` : "";
    const discountText = (b.discount ?? 0) > 0 ? `\nDiscount: ${b.discount}%` : "";
    const msg = `Hi ${b.customerName}! 🧾\n\nHere's your bill from Life Style Studio:\n${servicesText}\nAmount: ₹${b.amount.toLocaleString("en-IN")}${discountText}\n*Total: ₹${(b.finalAmount ?? b.amount).toLocaleString("en-IN")}*\nDate: ${new Date(b.date).toLocaleDateString("en-IN")}\n\nThank you for choosing us! 💫`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Opening WhatsApp...");
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">Track sales and revenue</p>
        </motion.div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> New Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{editId ? "Edit Bill" : "New Bill"}</DialogTitle>
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
                    >{s.name} (₹{s.price})</button>
                  ))}
                  {salonServices.length === 0 && <p className="text-xs text-muted-foreground font-body">Add services in Services page first</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="1500" className="h-11" />
              </div>
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-accent" /> Discount (%)
                </label>
                <div className="flex gap-2 mt-1">
                  {[0, 5, 10, 15, 20, 25, 30, 50].map(d => (
                    <button type="button" key={d} onClick={() => setForm({ ...form, discount: d.toString() })}
                      className={`text-xs px-3 py-1.5 rounded-full font-body transition-all ${parseFloat(form.discount) === d ? 'gold-gradient text-accent-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >{d}%</button>
                  ))}
                </div>
                <Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="0" className="h-11 mt-2" min="0" max="100" />
              </div>
              {form.amount && (
                <div className="rounded-xl bg-muted/50 p-4 border border-border">
                  <div className="flex justify-between text-sm font-body text-muted-foreground">
                    <span>Subtotal</span><span>₹{parseFloat(form.amount || "0").toLocaleString("en-IN")}</span>
                  </div>
                  {parseFloat(form.discount) > 0 && (
                    <div className="flex justify-between text-sm font-body text-accent mt-1">
                      <span>Discount ({form.discount}%)</span><span>-₹{Math.round(parseFloat(form.amount || "0") * parseFloat(form.discount) / 100).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-display font-bold text-foreground mt-2 pt-2 border-t border-border">
                    <span>Total</span><span>₹{calcFinal(form.amount, form.discount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
              <div>
                <label className="form-label">Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-11" />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" className="h-11" />
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                {editId ? "Update Bill" : "Add Bill"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer name or mobile..." className="pl-12 h-12 rounded-xl text-sm" />
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
                        {(b.discount ?? 0) > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body font-medium">{b.discount}% OFF</span>
                        )}
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
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {(b.discount ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground font-body text-xs line-through">
                          <IndianRupee className="h-3 w-3" />
                          {b.amount.toLocaleString('en-IN')}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-foreground font-display font-bold text-lg">
                        <IndianRupee className="h-4 w-4" />
                        {(b.finalAmount ?? b.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => sendBillToWhatsApp(b)}
                        className="p-2 rounded-lg hover:bg-[hsl(142,50%,90%)] transition-all text-muted-foreground hover:text-[hsl(142,70%,35%)]"
                        title="Send to WhatsApp">
                        <Send className="h-4 w-4" />
                      </button>
                      <button onClick={() => startEdit(b)}
                        className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
                        title="Edit bill">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => { deleteBilling(b.id); toast.success("Bill removed"); }}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive"
                        title="Delete bill">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
