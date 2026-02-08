import { useState } from "react";
import { useStore, Customer } from "@/store/useStore";
import { Plus, Search, Trash2, Edit2, UserPlus, Phone, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Customers = () => {
  const { customers, addCustomer, deleteCustomer, updateCustomer } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", date: new Date().toISOString().split("T")[0], services: "", notes: "" });

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile) { toast.error("Name and mobile are required"); return; }
    if (editId) {
      updateCustomer(editId, form);
      toast.success("Client updated");
      setEditId(null);
    } else {
      addCustomer(form);
      toast.success("Client added successfully");
    }
    setForm({ name: "", mobile: "", date: new Date().toISOString().split("T")[0], services: "", notes: "" });
    setOpen(false);
  };

  const startEdit = (c: Customer) => {
    setForm({ name: c.name, mobile: c.mobile, date: c.date, services: c.services || "", notes: c.notes || "" });
    setEditId(c.id);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{customers.length} total clients registered</p>
        </motion.div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ name: "", mobile: "", date: new Date().toISOString().split("T")[0], services: "", notes: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <UserPlus className="h-4 w-4 mr-2" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{editId ? "Edit Client" : "New Client"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Full Name *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client name" className="h-11" />
              </div>
              <div>
                <label className="form-label">Mobile Number *</label>
                <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="+91 9876543210" className="h-11" />
              </div>
              <div>
                <label className="form-label">Visit Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-11" />
              </div>
              <div>
                <label className="form-label">Services</label>
                <Input value={form.services} onChange={e => setForm({ ...form, services: e.target.value })} placeholder="Hair, Makeup, etc." className="h-11" />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes" className="h-11" />
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                {editId ? "Update Client" : "Add Client"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or mobile..."
          className="pl-12 h-12 rounded-xl text-sm"
        />
      </div>

      {/* Client Cards */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <div className="avatar-circle mx-auto mb-4 h-16 w-16">
            <Search className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="font-display text-xl text-foreground mb-1">No clients found</p>
          <p className="font-body text-sm text-muted-foreground">Try a different search or add a new client</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-hover p-5 group"
              >
                <div className="flex items-start gap-4">
                  <div className="avatar-circle shrink-0">
                    <span className="avatar-text">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body font-semibold text-foreground text-sm truncate">{c.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Phone className="h-3 w-3 text-accent" />
                      <span className="text-xs text-muted-foreground font-body">{c.mobile}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CalendarIcon className="h-3 w-3 text-accent" />
                      <span className="text-xs text-muted-foreground font-body">{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                    {c.services && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.services.split(",").map((s, si) => (
                          <span key={si} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body font-medium">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => startEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted transition-colors text-xs font-body text-muted-foreground hover:text-foreground">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => { deleteCustomer(c.id); toast.success("Client removed"); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-xs font-body text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Customers;
