import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Send, CheckCircle2, Users, MessageSquare } from "lucide-react";
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
      <div className="mb-8">
        <h1 className="text-4xl font-display font-semibold text-foreground">WhatsApp Messaging</h1>
        <p className="text-muted-foreground mt-1 font-body text-sm tracking-wide">Send personalized messages to your clients via WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message Compose */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gold" /> Compose Message
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-body font-medium mb-1 block">Choose Template</label>
                <Select value={selectedTemplate} onValueChange={v => { setSelectedTemplate(v); setCustomMessage(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
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
                  <label className="text-sm font-body font-medium mb-1 block">Custom Message</label>
                  <Textarea
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder="Hi {name}! Type your message..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Use {"{name}"} for personalization</p>
                </div>
              )}

              {template && (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs font-body font-medium text-muted-foreground mb-2 uppercase tracking-wide">Template Preview</p>
                  <p className="text-sm font-body whitespace-pre-wrap">{template.content}</p>
                </div>
              )}

              <Button
                onClick={sendMessages}
                disabled={sending || !message || selectedCustomers.size === 0}
                className="w-full bg-[hsl(142,70%,40%)] text-accent-foreground hover:bg-[hsl(142,70%,35%)] font-body tracking-wide"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : `Send to ${selectedCustomers.size} Client(s)`}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {message && selectedCustomers.size > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-3">Message Preview</h3>
              <div className="bg-[hsl(142,50%,95%)] rounded-lg p-4 text-sm font-body">
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
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" /> Select Clients
              </h2>
              <button
                onClick={toggleAll}
                className="text-sm font-body text-gold hover:text-gold-dark transition-colors"
              >
                {selectedCustomers.size === customers.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {customers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground font-body">
                No clients yet. Add clients first.
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {customers.map(c => (
                  <label
                    key={c.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCustomers.has(c.id)}
                      onCheckedChange={() => toggleCustomer(c.id)}
                    />
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-sm font-display font-semibold">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-foreground">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.mobile}</p>
                    </div>
                    {selectedCustomers.has(c.id) && <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />}
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
