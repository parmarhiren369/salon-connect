import { useState } from "react";
import { useStore, MessageTemplate } from "@/store/useStore";
import { Plus, Trash2, Edit2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  sale: "bg-gold/10 text-gold-dark",
  discount: "bg-accent/10 text-accent",
  festival: "bg-gold/20 text-gold-dark",
  general: "bg-muted text-muted-foreground",
};

const Templates = () => {
  const { templates, addTemplate, deleteTemplate, updateTemplate } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", content: "", category: "general" as MessageTemplate["category"] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) { toast.error("Name and content are required"); return; }
    if (editId) {
      updateTemplate(editId, form);
      toast.success("Template updated");
      setEditId(null);
    } else {
      addTemplate(form);
      toast.success("Template created");
    }
    setForm({ name: "", content: "", category: "general" });
    setOpen(false);
  };

  const startEdit = (t: MessageTemplate) => {
    setForm({ name: t.name, content: t.content, category: t.category });
    setEditId(t.id);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-semibold text-foreground">Message Templates</h1>
          <p className="text-muted-foreground mt-1 font-body text-sm tracking-wide">
            Use <code className="bg-muted px-1 rounded text-xs">{"{name}"}</code> to personalize messages
          </p>
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ name: "", content: "", category: "general" }); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-body tracking-wide">
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{editId ? "Edit Template" : "Create Template"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-body font-medium mb-1 block">Template Name *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" />
              </div>
              <div>
                <label className="text-sm font-body font-medium mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as MessageTemplate["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body font-medium mb-1 block">Message Content *</label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Hi {name}! Your message here..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">Use {"{name}"} — it will be replaced with each client's name</p>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body tracking-wide">
                {editId ? "Update Template" : "Create Template"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xl font-semibold">{t.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-body tracking-wide uppercase ${categoryColors[t.category]}`}>
                  {t.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-body flex-1 whitespace-pre-wrap leading-relaxed">{t.content}</p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button onClick={() => startEdit(t)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => { deleteTemplate(t.id); toast.success("Template deleted"); }} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Templates;
