import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Send, CheckCircle2, Users, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Messaging = () => {
  const { customers, templates } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const template = templates.find(t => t.id === selectedTemplate);
  const message = template ? template.content : customMessage;

  const toggleAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map(c => c.id)));
    }
  };

  const toggleCustomer = (id: string) => {
    const next = new Set(selectedCustomers);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedCustomers(next);
  };

  const sendMessages = () => {
    if (!message) { toast.error("Please write a message or select a template"); return; }
    if (selectedCustomers.size === 0) { toast.error("Please select at least one client"); return; }

    setSending(true);
    const selected = customers.filter(c => selectedCustomers.has(c.id));

    selected.forEach((c, i) => {
      const personalizedMsg = message.replace(/\{name\}/gi, c.name);
      const phone = c.mobile.replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(personalizedMsg)}`;

      setTimeout(() => {
        window.open(waUrl, "_blank");
      }, i * 800);
    });

    toast.success(`Opening WhatsApp for ${selected.length} client(s)`);
    setTimeout(() => setSending(false), selected.length * 800 + 500);
  };

  const previewMessage = (name: string) => message.replace(/\{name\}/gi, name);

  return (
    <div>
      <div className="page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Messaging</h1>
          <p className="page-subtitle">Send personalized WhatsApp messages to your clients</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-5"
        >
          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-5 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-accent-foreground" />
              </div>
              Compose Message
            </h2>

            <div className="space-y-4">
              <div>
                <label className="form-label">Choose Template</label>
                <Select value={selectedTemplate} onValueChange={v => { setSelectedTemplate(v); setCustomMessage(""); }}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select a template..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">✍️ Custom Message</SelectItem>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedTemplate === "custom" || !selectedTemplate) && (
                <div>
                  <label className="form-label">Custom Message</label>
                  <Textarea
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder="Hi {name}! Type your message..."
                    rows={5}
                    className="text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 tracking-wider font-body">Use {"{name}"} for personalization</p>
                </div>
              )}

              {template && (
                <div className="rounded-xl overflow-hidden border border-border">
                  {template.imageUrl && (
                    <img src={template.imageUrl} alt="Brochure" className="w-full h-32 object-cover" />
                  )}
                  <div className="bg-muted/50 p-4">
                    <p className="text-[10px] font-body font-semibold text-muted-foreground mb-2 uppercase tracking-widest">Template Preview</p>
                    <p className="text-sm font-body whitespace-pre-wrap">{template.content}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={sendMessages}
                disabled={sending || !message || selectedCustomers.size === 0}
                className="w-full h-12 bg-[hsl(142,70%,40%)] text-accent-foreground hover:bg-[hsl(142,70%,35%)] font-body tracking-wider text-sm shadow-lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : `Send to ${selectedCustomers.size} Client(s)`}
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          {message && selectedCustomers.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5"
            >
              <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Live Preview
              </h3>
              <div className="bg-[hsl(142,50%,95%)] rounded-xl p-4 text-sm font-body border border-[hsl(142,30%,85%)]">
                {previewMessage(customers.find(c => selectedCustomers.has(c.id))?.name || "Client")}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Client Selection */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center">
                  <Users className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Select Clients</h2>
                  <p className="text-[10px] text-muted-foreground tracking-wider font-body">
                    {selectedCustomers.size} of {customers.length} selected
                  </p>
                </div>
              </div>
              <button
                onClick={toggleAll}
                className="text-xs font-body font-semibold tracking-wider uppercase text-accent hover:text-gold-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/10"
              >
                {selectedCustomers.size === customers.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {customers.length === 0 ? (
              <div className="p-16 text-center">
                <div className="avatar-circle mx-auto mb-4 h-16 w-16">
                  <Users className="h-7 w-7 text-accent-foreground" />
                </div>
                <p className="font-display text-xl text-foreground mb-1">No clients yet</p>
                <p className="font-body text-sm text-muted-foreground">Add clients first to start messaging</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {customers.map(c => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${
                      selectedCustomers.has(c.id) ? "bg-accent/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <Checkbox
                      checked={selectedCustomers.has(c.id)}
                      onCheckedChange={() => toggleCustomer(c.id)}
                    />
                    <div className="avatar-circle h-9 w-9 shrink-0">
                      <span className="avatar-text text-xs">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{c.mobile}</p>
                    </div>
                    {selectedCustomers.has(c.id) && (
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Messaging;
