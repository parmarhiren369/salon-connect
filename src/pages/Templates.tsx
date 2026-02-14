import { useState, useRef } from "react";
import { useStore, MessageTemplate } from "@/store/useStore";
import { Plus, Trash2, Edit2, ImagePlus, X, Sparkles } from "lucide-react";
import { useFirebase } from "@/lib/firebase-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const categoryConfig: Record<string, { bg: string; text: string; label: string }> = {
  sale: { bg: "bg-accent/15", text: "text-accent", label: "Sale" },
  discount: { bg: "bg-gold-dark/15", text: "text-gold-dark", label: "Discount" },
  festival: { bg: "bg-accent/20", text: "text-gold-dark", label: "Festival" },
  general: { bg: "bg-muted", text: "text-muted-foreground", label: "General" },
};

const Templates = () => {
  const { templates, addTemplate, deleteTemplate, updateTemplate } = useStore();
  const { auth } = useFirebase();
  
  // Extract sender name from email (part before @)
  const senderName = auth.currentUser?.email?.split('@')[0] || 'Salon';
  
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", content: "", category: "general" as MessageTemplate["category"], imageUrl: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

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
    setForm({ name: "", content: "", category: "general", imageUrl: "" });
    setOpen(false);
  };

  const startEdit = (t: MessageTemplate) => {
    setForm({ name: t.name, content: t.content, category: t.category, imageUrl: t.imageUrl || "" });
    setEditId(t.id);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle">
            Create message templates with brochures • Use <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">{"{name}"}</code> for client name • <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">{"{sender}"}</code> for your name ({senderName})
          </p>
        </motion.div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ name: "", content: "", category: "general", imageUrl: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{editId ? "Edit Template" : "Create Template"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Template Name *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" className="h-11" />
              </div>
              <div>
                <label className="form-label">Category</label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as MessageTemplate["category"] })}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">🏷️ Sale</SelectItem>
                    <SelectItem value="discount">💰 Discount</SelectItem>
                    <SelectItem value="festival">🎊 Festival</SelectItem>
                    <SelectItem value="general">📋 General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Message Content *</label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder={`Hi {name}! Your message here... - {sender}`}
                  rows={4}
                  className="text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-1 tracking-wider font-body">
                  Use {"{name}"} for client name • Use {"{sender}"} for your name ({senderName})
                </p>
              </div>

              {/* Image / Brochure Upload */}
              <div>
                <label className="form-label">Brochure / Image (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {form.imageUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-border">
                    <img src={form.imageUrl} alt="Brochure" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, imageUrl: "" }))}
                        className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-accent/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent"
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-body tracking-wider">Upload Brochure Image</span>
                  </button>
                )}
              </div>

              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                {editId ? "Update Template" : "Create Template"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Cards */}
      {templates.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <div className="avatar-circle mx-auto mb-4 h-16 w-16">
            <Sparkles className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="font-display text-xl text-foreground mb-1">No templates yet</p>
          <p className="font-body text-sm text-muted-foreground">Create your first template to start messaging</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {templates.map((t, i) => {
              const cat = categoryConfig[t.category] || categoryConfig.general;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card-hover overflow-hidden flex flex-col group"
                >
                  {/* Brochure Image */}
                  {t.imageUrl && (
                    <div className="relative h-44 overflow-hidden">
                      <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-xl font-semibold text-foreground leading-tight">{t.name}</h3>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-body tracking-wider uppercase font-semibold shrink-0 ml-2 ${cat.bg} ${cat.text}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-body flex-1 whitespace-pre-wrap leading-relaxed line-clamp-4">{t.content}</p>
                    <div className="flex gap-1 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => startEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted transition-colors text-xs font-body text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button onClick={() => { deleteTemplate(t.id); toast.success("Template deleted"); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-xs font-body text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Templates;
