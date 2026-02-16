import { useState, useMemo } from "react";
import { useStore, Billing as BillingType } from "@/store/useStore";
import { Search, Plus, DollarSign, Calendar, TrendingUp, X, Edit2, Trash2, Send, FileText, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/utils";
import jsPDF from "jspdf";
import logoImg from "@/assets/logo.png";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
] as const;

const getPaymentLabel = (method?: string) => {
  const found = PAYMENT_METHODS.find(m => m.value === method);
  return found?.label || "—";
};

const Billings = () => {
  const { billings, addBilling, updateBilling, deleteBilling, customers, salonServices } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [servicesOpen, setServicesOpen] = useState(false);
  const [serviceCategory, setServiceCategory] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });
  const [form, setForm] = useState({
    customerId: "",
    selectedServices: [] as { id: string; name: string; price: number }[],
    discount: 0,
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash" as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other'
  });

  const filtered = billings.filter(b => {
    const matchesService = !serviceSearch || b.service.toLowerCase().includes(serviceSearch.toLowerCase());
    const billingDate = new Date(b.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDateRange = billingDate >= startDate && billingDate <= endDate;
    return matchesService && matchesDateRange;
  });

  const totalRevenue = filtered.reduce((sum, b) => sum + parseFloat(String(b.amount)), 0);

  const subtotal = form.selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discountAmount = (subtotal * (form.discount || 0)) / 100;
  const totalAmount = subtotal - discountAmount;

  const serviceCategories = useMemo(() => {
    const categories = salonServices.map(s => s.category).filter(Boolean) as string[];
    return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
  }, [salonServices]);

  const servicesByCategory = useMemo(() => {
    if (!serviceCategory) return [];
    return salonServices.filter(s => s.category === serviceCategory);
  }, [salonServices, serviceCategory]);

  const addService = (service: { id: string; name: string; price: number }) => {
    if (!form.selectedServices.find(s => s.id === service.id)) {
      setForm({ ...form, selectedServices: [...form.selectedServices, service] });
    }
  };

  const removeService = (serviceId: string) => {
    setForm({
      ...form,
      selectedServices: form.selectedServices.filter(s => s.id !== serviceId)
    });
  };

  const resetForm = () => {
    setForm({ customerId: "", selectedServices: [], discount: 0, date: new Date().toISOString().split("T")[0], paymentMethod: "cash" });
    setServiceCategory("");
    setEditId(null);
  };

  const startEdit = (billingId: string) => {
    const b = billings.find(x => x.id === billingId);
    if (!b) return;
    const serviceNames = b.service ? b.service.split(", ") : [];
    const selected = serviceNames
      .map(name => salonServices.find(s => s.name === name))
      .filter(Boolean) as { id: string; name: string; price: number }[];
    const amountValue = typeof b.amount === "string" ? parseFloat(b.amount) : b.amount;
    const fallbackSelected = selected.length === 0 && b.service
      ? [{ id: `custom-${b.id}`, name: b.service, price: amountValue || 0 }]
      : selected;
    setForm({
      customerId: b.customerId,
      selectedServices: fallbackSelected,
      discount: b.discount ?? 0,
      date: b.date,
      paymentMethod: b.paymentMethod || "cash"
    });
    const firstService = fallbackSelected[0];
    setServiceCategory(firstService ? salonServices.find(s => s.id === firstService.id)?.category || "" : "");
    setEditId(b.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || form.selectedServices.length === 0) {
      toast.error("Please select client and at least one service");
      return;
    }
    
    const serviceNames = form.selectedServices.map(s => s.name).join(", ");
    const customer = customers.find(c => c.id === form.customerId);
    const payload = {
      customerId: form.customerId,
      customerName: customer?.name || "Unknown",
      service: serviceNames,
      services: form.selectedServices.map(s => s.name),
      amount: totalAmount,
      discount: form.discount,
      finalAmount: totalAmount,
      date: form.date,
      paymentMethod: form.paymentMethod,
    };
    if (editId) {
      updateBilling(editId, payload);
      toast.success("Billing updated successfully");
    } else {
      addBilling(payload);
      toast.success("Billing added successfully");
    }
    resetForm();
    setOpen(false);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const generatePDF = (b: BillingType): jsPDF => {
    const doc = new jsPDF({ unit: "mm", format: "a5" });
    const w = doc.internal.pageSize.getWidth();
    const customer = customers.find(c => c.id === b.customerId);
    const amt = typeof b.amount === 'number' ? b.amount : parseFloat(String(b.amount));
    const finalAmt = b.finalAmount ?? amt;

    try { doc.addImage(logoImg, "PNG", 10, 8, 18, 18); } catch { /* skip */ }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Life Style Studio", 32, 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Beauty & Wellness", 32, 22);

    doc.setDrawColor(191, 155, 48);
    doc.setLineWidth(0.8);
    doc.line(10, 30, w - 10, 30);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("INVOICE", w - 10, 16, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Date: ${formatDate(b.date)}`, w - 10, 22, { align: "right" });

    let y = 38;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Bill To:", 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(b.customerName || customer?.name || "Customer", 32, y);
    y += 5;
    if (customer?.mobile) {
      doc.text(`Phone: ${customer.mobile}`, 32, y);
      y += 5;
    }
    doc.text(`Payment: ${getPaymentLabel(b.paymentMethod)}`, 32, y);
    y += 8;

    doc.setFillColor(245, 240, 230);
    doc.rect(10, y, w - 20, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("Service", 12, y + 5);
    doc.text("Amount", w - 12, y + 5, { align: "right" });
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const services = (b.services && b.services.length > 0) ? b.services : (b.service ? b.service.split(", ") : ["Service"]);
    services.forEach(s => {
      const svc = salonServices.find(sv => sv.name === s);
      doc.text(s, 12, y);
      doc.text(svc ? `Rs.${svc.price.toLocaleString("en-IN")}` : "—", w - 12, y, { align: "right" });
      y += 6;
    });

    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(10, y, w - 10, y);
    y += 6;

    doc.setFontSize(9);
    doc.text("Subtotal", 12, y);
    doc.text(`Rs.${amt.toLocaleString("en-IN")}`, w - 12, y, { align: "right" });
    y += 6;

    if ((b.discount ?? 0) > 0) {
      doc.setTextColor(191, 155, 48);
      doc.text(`Discount (${b.discount}%)`, 12, y);
      doc.text(`-Rs.${Math.round(amt * (b.discount ?? 0) / 100).toLocaleString("en-IN")}`, w - 12, y, { align: "right" });
      y += 6;
    }

    doc.setDrawColor(191, 155, 48);
    doc.setLineWidth(0.8);
    doc.line(10, y, w - 10, y);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text("Total", 12, y);
    doc.text(`Rs.${finalAmt.toLocaleString("en-IN")}`, w - 12, y, { align: "right" });

    y += 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for choosing Life Style Studio!", w / 2, y, { align: "center" });

    return doc;
  };

  const buildBillingSummary = (b: BillingType) => {
    const customer = customers.find(c => c.id === b.customerId);
    const amt = typeof b.amount === 'number' ? b.amount : parseFloat(String(b.amount));
    const finalAmt = b.finalAmount ?? amt;
    const services = (b.services && b.services.length > 0) ? b.services : (b.service ? b.service.split(", ") : []);
    const lineItems = services.map((serviceName) => {
      const svc = salonServices.find(s => s.name === serviceName);
      const price = svc ? `₹${svc.price.toLocaleString("en-IN")}` : "—";
      return `• ${serviceName} (${price})`;
    }).join("\n");
    const discountValue = b.discount ?? 0;
    const discountAmountValue = discountValue > 0 ? Math.round(amt * discountValue / 100) : 0;

    return {
      customerName: customer?.name || b.customerName || "Customer",
      total: finalAmt,
      subtotal: amt,
      discountValue,
      discountAmount: discountAmountValue,
      payment: getPaymentLabel(b.paymentMethod),
      lineItems,
      date: formatDate(b.date),
    };
  };

  const downloadPDF = (b: BillingType) => {
    const customer = customers.find(c => c.id === b.customerId);
    const doc = generatePDF(b);
    doc.save(`invoice-${(customer?.name || 'bill').replace(/\s+/g, '-')}-${b.date}.pdf`);
    toast.success("PDF downloaded");
  };

  const sendBillPDFToWhatsApp = (b: BillingType) => {
    const customer = customers.find(c => c.id === b.customerId);
    if (!customer) { toast.error("Customer not found"); return; }
    const phone = customer.mobile.replace(/[^0-9]/g, "");

    const summary = buildBillingSummary(b);
    const discountLine = summary.discountValue > 0
      ? `Discount (${summary.discountValue}%): -₹${summary.discountAmount.toLocaleString("en-IN")}`
      : "Discount: —";
    const msg = `Hi ${summary.customerName}! 🧾\n\nYour bill from Life Style Studio:\n\nServices:\n${summary.lineItems || "• Service"}\n\nSubtotal: ₹${summary.subtotal.toLocaleString("en-IN")}\n${discountLine}\nTotal: ₹${summary.total.toLocaleString("en-IN")}\nPayment: ${summary.payment}\nDate: ${summary.date}\n\nThank you for choosing Life Style Studio! 💫`;
    
    // Detect if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `whatsapp://send?phone=${phone.startsWith("91") ? phone : "91" + phone}&text=${encodeURIComponent(msg)}`
      : `https://web.whatsapp.com/send?phone=${phone.startsWith("91") ? phone : "91" + phone}&text=${encodeURIComponent(msg)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, "_blank");
    
    // Generate and prepare PDF for download
    const doc = generatePDF(b);
    const fileName = `invoice-${customer.name.replace(/\s+/g, '-')}-${b.date}.pdf`;
    
    // Show instructions based on device
    if (isMobile) {
      toast.success("WhatsApp opened! PDF ready - click Download to attach in chat", {
        duration: 10000,
        action: {
          label: "Download PDF",
          onClick: () => doc.save(fileName)
        }
      });
    } else {
      toast.success("WhatsApp Web opened! PDF ready - click Download to attach", {
        duration: 10000,
        action: {
          label: "Download PDF",
          onClick: () => doc.save(fileName)
        }
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Billings & Services</h1>
          <p className="page-subtitle">Track services and revenue</p>
        </motion.div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Billing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{editId ? "Edit Billing" : "New Billing"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Client *</label>
                <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.mobile}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Service Category</label>
                <Select value={serviceCategory} onValueChange={v => setServiceCategory(v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Filter by category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Categories</SelectItem>
                    {serviceCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Services *</label>
                <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full h-11 justify-between font-normal"
                    >
                      {form.selectedServices.length > 0
                        ? `${form.selectedServices.length} service(s) selected`
                        : "Select services..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search services..." />
                      <CommandEmpty>No services found.</CommandEmpty>
                      {(serviceCategory && serviceCategory !== "__all__" ? serviceCategories.filter(c => c === serviceCategory) : serviceCategories).map(cat => (
                        <CommandGroup key={cat} heading={cat} className="max-h-64 overflow-auto">
                          {salonServices.filter(s => s.category === cat).map((service) => {
                            const isSelected = form.selectedServices.some(sel => sel.id === service.id);
                            return (
                              <CommandItem
                                key={service.id}
                                onSelect={() => isSelected ? removeService(service.id) : addService(service)}
                                className={`cursor-pointer ${isSelected ? 'bg-accent/20' : ''}`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${isSelected ? 'bg-accent border-accent' : 'border-muted-foreground/30'}`}>
                                      {isSelected && <span className="text-accent-foreground text-xs">✓</span>}
                                    </div>
                                    <span>{service.name}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">₹{service.price}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      ))}
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {form.selectedServices.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.selectedServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border"
                      >
                        <span className="text-sm font-medium">{service.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-accent font-semibold">₹{service.price}</span>
                          <button
                            type="button"
                            onClick={() => removeService(service.id)}
                            className="h-6 w-6 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                        <span className="text-sm font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {form.discount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Discount ({form.discount}%):</span>
                          <span className="text-sm font-medium text-destructive">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Final Amount:</span>
                        <span className="text-lg font-bold text-accent">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Discount (%)</label>
                  <Input
                    type="number"
                    value={form.discount}
                    onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-11"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="form-label">Payment Method</label>
                  <Select value={form.paymentMethod} onValueChange={(v: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other') => setForm({ ...form, paymentMethod: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          <span className="flex items-center gap-2">
                            <m.icon className="h-3.5 w-3.5" /> {m.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="form-label">Date *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                {editId ? "Update Billing" : "Add Billing"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg gold-gradient flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-3xl font-display font-bold">₹{totalRevenue.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">Total Revenue</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg gold-gradient flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-3xl font-display font-bold">{filtered.length}</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">Total Services</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg gold-gradient flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-3xl font-display font-bold">
              {filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(2) : "0.00"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-body">Avg. per Service</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="form-label text-xs">Date Range</label>
            <div className="flex flex-row gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="h-10 text-sm"
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="h-10 text-sm"
                placeholder="End Date"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="form-label text-xs">Search by Service</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                placeholder="Search services..."
                className="pl-10 h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billings Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-body text-sm font-semibold">Date</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Client</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Service</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Payment</th>
                <th className="text-right p-4 font-body text-sm font-semibold">Amount</th>
                <th className="text-right p-4 font-body text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-accent/10">
                        <DollarSign className="h-8 w-8 text-accent" />
                      </div>
                      <p className="font-display text-xl text-foreground">No billings found</p>
                      <p className="text-sm text-muted-foreground">Add your first billing to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors group"
                  >
                    <td className="p-4 font-body text-sm text-muted-foreground">
                      {formatDate(b.date)}
                    </td>
                    <td className="p-4 font-body text-sm font-medium">{b.customerName || getCustomerName(b.customerId)}</td>
                    <td className="p-4 font-body text-sm">{b.service}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-body font-medium">
                        {getPaymentLabel(b.paymentMethod)}
                      </span>
                    </td>
                    <td className="p-4 font-body text-sm font-semibold text-right">₹{parseFloat(String(b.amount)).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => downloadPDF(b)}
                          className="p-2 rounded-lg hover:bg-accent/10 transition-all text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100"
                          title="Download PDF">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button onClick={() => sendBillPDFToWhatsApp(b)}
                          className="p-2 rounded-lg hover:bg-accent/10 transition-all text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100"
                          title="Send via WhatsApp">
                          <Send className="h-4 w-4" />
                        </button>
                        <button onClick={() => startEdit(b.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                          title="Edit billing">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => { deleteBilling(b.id); toast.success("Billing removed"); }}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                          title="Delete billing">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billings;
