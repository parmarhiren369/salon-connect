import { useState } from "react";
import { useStore, SalonService } from "@/store/useStore";
import { Plus, Search, Trash2, Edit2, Scissors, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Services = () => {
  const { salonServices, addSalonService, deleteSalonService, updateSalonService } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category: "" });

  const filtered = salonServices.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(salonServices.map(s => s.category).filter(Boolean))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
    const data = { name: form.name, price: parseFloat(form.price), category: form.category || "General" };
    if (editId) {
      updateSalonService(editId, data);
      toast.success("Service updated");
      setEditId(null);
    } else {
      addSalonService(data);
      toast.success("Service added");
    }
    setForm({ name: "", price: "", category: "" });
    setOpen(false);
  };

  const startEdit = (s: SalonService) => {
    setForm({ name: s.name, price: s.price.toString(), category: s.category });
    setEditId(s.id);
    setOpen(true);
  };

  const grouped = filtered.reduce<Record<string, SalonService[]>>((acc, s) => {
    const cat = s.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">{salonServices.length} services available</p>
        </motion.div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ name: "", price: "", category: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{editId ? "Edit Service" : "New Service"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Service Name *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hair Cut, Facial..." className="h-11" />
              </div>
              <div>
                <label className="form-label">Price (₹) *</label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="500" className="h-11" />
              </div>
              <div>
                <label className="form-label">Category</label>
                <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Hair, Skin, Makeup..." className="h-11" list="service-categories" />
                <datalist id="service-categories">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                {editId ? "Update Service" : "Add Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className="pl-12 h-12 rounded-xl text-sm" />
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <div className="avatar-circle mx-auto mb-4 h-16 w-16">
            <Scissors className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="font-display text-xl text-foreground mb-1">No services found</p>
          <p className="font-body text-sm text-muted-foreground">Add your salon services to get started</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, services]) => (
            <div key={category}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full gold-gradient" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {services.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-card-hover p-5 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center">
                            <Scissors className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div>
                            <h3 className="font-body font-semibold text-foreground text-sm">{s.name}</h3>
                            <span className="text-xs text-muted-foreground font-body">{s.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-accent font-display text-lg font-bold">
                          <IndianRupee className="h-4 w-4" />
                          {s.price}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => startEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted transition-colors text-xs font-body text-muted-foreground hover:text-foreground">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button onClick={() => { deleteSalonService(s.id); toast.success("Service removed"); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-xs font-body text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
