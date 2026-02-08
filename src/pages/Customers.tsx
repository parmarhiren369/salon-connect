import { useState } from "react";
import { useStore, Customer } from "@/store/useStore";
import { Plus, Search, Trash2, Edit2, X, Check } from "lucide-react";
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-semibold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1 font-body text-sm tracking-wide">{customers.length} total clients</p>
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ name: "", mobile: "", date: new Date().toISOString().split("T")[0], services: "", notes: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-body tracking-wide">
              <Plus className="h-4 w-4 mr-2" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{editId ? "Edit Client" : "New Client"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Name *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client name" />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Mobile Number *</label>
                <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Services</label>
                <Input value={form.services} onChange={e => setForm({ ...form, services: e.target.value })} placeholder="Hair, Makeup, etc." />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes" />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body tracking-wide">
                {editId ? "Update Client" : "Add Client"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or mobile..."
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted text-sm font-body font-medium text-muted-foreground tracking-wide uppercase">
          <span>Name</span><span>Mobile</span><span>Date</span><span>Services</span><span>Actions</span>
        </div>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground font-body">No clients found</div>
          ) : (
            filtered.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-t border-border items-center hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground text-sm font-display font-semibold">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="font-body font-medium truncate">{c.name}</span>
                </div>
                <span className="font-body text-sm text-muted-foreground">{c.mobile}</span>
                <span className="font-body text-sm text-muted-foreground">{new Date(c.date).toLocaleDateString()}</span>
                <span className="font-body text-sm text-muted-foreground truncate">{c.services || "—"}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => { deleteCustomer(c.id); toast.success("Client removed"); }} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Customers;
