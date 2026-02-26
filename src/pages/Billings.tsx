import { useState } from "react";
import { useStore, Billing as BillingType } from "@/store/useStore";
import { Search, Plus, DollarSign, Calendar, TrendingUp, X, Edit2, Trash2, Send, FileText, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import jsPDF from "jspdf";
import logoImg from "@/assets/logo.png";

const SALON_ADDRESS = "Address: Shop No. 18, Ground Floor, Samanway Westfields, High Tention Road, opp. Raj Path Complex, Bhayli, Vadodara, Gujarat 391410";
const SALON_PHONE = "7600572772";

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

type BillingLineItem = {
  id: string;
  serviceId?: string;
  name: string;
  price: number;
  discount: number;
};

const createLineItem = (seed?: Partial<BillingLineItem>): BillingLineItem => ({
  id: seed?.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  serviceId: seed?.serviceId,
  name: seed?.name || "",
  price: Number(seed?.price) || 0,
  discount: Number(seed?.discount) || 0,
});

const Billings = () => {
  const { billings, addBilling, updateBilling, deleteBilling, customers, salonServices } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });
  const [form, setForm] = useState({
    customerId: "",
    selectedServices: [createLineItem()] as BillingLineItem[],
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash" as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other'
  });

  const filtered = billings.filter(b => {
    const matchesService = !serviceSearch || b.service.toLowerCase().includes(serviceSearch.toLowerCase());
    const billingDate = new Date(b.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    const matchesDateRange = billingDate >= startDate && billingDate <= endDate;
    return matchesService && matchesDateRange;
  }).sort((a, b) => {
    const aCreated = new Date((a as BillingType & { createdAt?: string }).createdAt || a.date).getTime();
    const bCreated = new Date((b as BillingType & { createdAt?: string }).createdAt || b.date).getTime();
    return bCreated - aCreated;
  });

  const totalRevenue = filtered.reduce((sum, b) => {
    const finalAmount = b.finalAmount ?? parseFloat(String(b.amount));
    return sum + (Number.isFinite(finalAmount) ? finalAmount : 0);
  }, 0);

  const subtotal = form.selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const discountAmount = form.selectedServices.reduce((sum, service) => {
    const servicePrice = Number(service.price) || 0;
    const serviceDiscount = Number(service.discount) || 0;
    return sum + (servicePrice * serviceDiscount) / 100;
  }, 0);
  const totalAmount = subtotal - discountAmount;

  const addService = (service: { id: string; name: string; price: number }) => {
    const lineItem = createLineItem({
      serviceId: service.id,
      name: service.name,
      price: Number(service.price) || 0,
    });
    setForm(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, lineItem]
    }));
  };

  const addEmptyService = () => {
    setForm(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, createLineItem()]
    }));
  };

  const removeService = (serviceLineId: string) => {
    setForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(s => s.id !== serviceLineId)
    }));
  };

  const updateService = (serviceLineId: string, patch: Partial<BillingLineItem>) => {
    setForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.map(item => {
        if (item.id !== serviceLineId) return item;
        return {
          ...item,
          ...patch,
          price: patch.price !== undefined ? Number(patch.price) || 0 : item.price,
          discount: patch.discount !== undefined ? Number(patch.discount) || 0 : item.discount,
        };
      })
    }));
  };

  const getItemSubtotal = (item: BillingLineItem) => {
    const servicePrice = Number(item.price) || 0;
    const serviceDiscount = Number(item.discount) || 0;
    return servicePrice - (servicePrice * serviceDiscount) / 100;
  };

  const resetForm = () => {
    setForm({ customerId: "", selectedServices: [createLineItem()], date: new Date().toISOString().split("T")[0], paymentMethod: "cash" });
    setEditId(null);
  };

  const startEdit = (billingId: string) => {
    const b = billings.find(x => x.id === billingId);
    if (!b) return;
    const amountValue = typeof b.amount === "string" ? parseFloat(b.amount) : b.amount;
    const savedLineItems = (b.lineItems || [])
      .filter(item => item && item.name)
      .map((item, index) => createLineItem({
        id: `stored-${b.id}-${index}`,
        name: item.name,
        price: Number(item.amount) || 0,
        discount: Number(item.discount) || 0,
      }));

    let fallbackSelected = savedLineItems;

    if (fallbackSelected.length === 0) {
      const serviceNames = b.service
        ? b.service.split(",").map(name => name.trim()).filter(Boolean)
        : [];
      const equallySplitAmount = serviceNames.length > 0
        ? (Number(amountValue) || 0) / serviceNames.length
        : Number(amountValue) || 0;

      fallbackSelected = serviceNames.map((name, index) => {
        const matchedService = salonServices.find(s => s.name === name);
        if (matchedService) {
          return createLineItem({
            id: `${matchedService.id}-${index}-${Date.now()}`,
            serviceId: matchedService.id,
            name: matchedService.name,
            price: matchedService.price,
            discount: b.discount ?? 0,
          });
        }
        return createLineItem({
          id: `custom-${b.id}-${index}`,
          name,
          price: equallySplitAmount,
          discount: b.discount ?? 0,
        });
      });
    }

    if (fallbackSelected.length === 0) {
      fallbackSelected = [createLineItem({ id: `custom-${b.id}`, name: b.service || "", price: Number(amountValue) || 0, discount: b.discount ?? 0 })];
    }

    setForm({
      customerId: b.customerId,
      selectedServices: fallbackSelected,
      date: b.date,
      paymentMethod: b.paymentMethod || "cash"
    });
    setEditId(b.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || form.selectedServices.length === 0) {
      toast.error("Please select client and at least one service");
      return;
    }

    const hasInvalidItem = form.selectedServices.some(item => !item.name.trim());
    if (hasInvalidItem) {
      toast.error("Each item must have a service name");
      return;
    }
    
    const serviceNames = form.selectedServices.map(s => s.name).join(", ");
    const customer = customers.find(c => c.id === form.customerId);
    const effectiveDiscount = subtotal > 0 ? Number(((discountAmount / subtotal) * 100).toFixed(2)) : 0;
    const lineItems = form.selectedServices.map(item => ({
      name: item.name.trim(),
      amount: Number(item.price) || 0,
      discount: Number(item.discount) || 0,
      finalAmount: getItemSubtotal(item),
    }));
    const payload = {
      customerId: form.customerId,
      customerName: customer?.name || "Unknown",
      service: serviceNames,
      services: form.selectedServices.map(s => s.name),
      lineItems,
      amount: subtotal,
      discount: effectiveDiscount,
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
    const savedLineItems = (b.lineItems || []).filter(item => item && item.name);
    const fallbackServices = (b.services && b.services.length > 0) ? b.services : (b.service ? b.service.split(", ") : ["Service"]);
    const fallbackAmountPerService = fallbackServices.length > 0 ? (Number(amt) || 0) / fallbackServices.length : Number(amt) || 0;

    const invoiceItems = savedLineItems.length > 0
      ? savedLineItems.map(item => {
          const itemAmount = Number(item.amount) || 0;
          const itemDiscount = Number(item.discount) || 0;
          const calculatedFinal = itemAmount - (itemAmount * itemDiscount) / 100;
          return {
            name: item.name,
            amount: itemAmount,
            discount: itemDiscount,
            finalAmount: Number(item.finalAmount ?? calculatedFinal),
          };
        })
      : fallbackServices.map(serviceName => {
          const svc = salonServices.find(sv => sv.name === serviceName);
          const itemAmount = svc ? Number(svc.price) || 0 : fallbackAmountPerService;
          return {
            name: serviceName,
            amount: itemAmount,
            discount: Number(b.discount) || 0,
            finalAmount: itemAmount - (itemAmount * (Number(b.discount) || 0)) / 100,
          };
        });

    const subtotalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const discountTotal = invoiceItems.reduce((sum, item) => sum + (item.amount - item.finalAmount), 0);
    const finalAmt = b.finalAmount ?? invoiceItems.reduce((sum, item) => sum + item.finalAmount, 0);

    try { doc.addImage(logoImg, "PNG", 10, 7, 22, 22); } catch { /* skip */ }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Life Style Studio", 32, 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Beauty & Wellness", 32, 22);

    const headerAddress = doc.splitTextToSize(SALON_ADDRESS, w - 74);
    doc.setFontSize(6.5);
    doc.setTextColor(130, 130, 130);
    doc.text(headerAddress, 32, 26);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const phoneY = 26 + (headerAddress.length * 3) + 2;
    doc.text(`Ph: ${SALON_PHONE}`, 32, phoneY);

    doc.setDrawColor(191, 155, 48);
    doc.setLineWidth(0.8);
    doc.line(10, 38, w - 10, 38);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("INVOICE", w - 10, 16, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Date: ${formatDate(b.date)}`, w - 10, 22, { align: "right" });

    let y = 46;
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
    invoiceItems.forEach((item) => {
      doc.text(item.name, 12, y);
      doc.text(`Rs.${item.amount.toLocaleString("en-IN")}`, w - 12, y, { align: "right" });
      y += 5;

      const itemDiscountAmount = Math.max(0, item.amount - item.finalAmount);
      doc.setFontSize(8);
      doc.setTextColor(191, 155, 48);
      doc.text(`Discount (${item.discount.toLocaleString("en-IN")}%)`, 12, y);
      doc.text(`-Rs.${itemDiscountAmount.toLocaleString("en-IN")}`, w - 12, y, { align: "right" });
      doc.setTextColor(50, 50, 50);
      y += 6;
    });

    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(10, y, w - 10, y);
    y += 6;

    doc.setFontSize(9);
    doc.text("Subtotal", 12, y);
    doc.text(`Rs.${subtotalAmount.toLocaleString("en-IN")}`, w - 12, y, { align: "right" });
    y += 6;

    doc.setTextColor(191, 155, 48);
    doc.text("Discount", 12, y);
    doc.text(`-Rs.${discountTotal.toLocaleString("en-IN")}`, w - 12, y, { align: "right" });
    y += 6;

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
    const savedLineItems = (b.lineItems || []).filter(item => item && item.name);
    const fallbackServices = (b.services && b.services.length > 0) ? b.services : (b.service ? b.service.split(", ") : []);
    const fallbackAmountPerService = fallbackServices.length > 0 ? (Number(amt) || 0) / fallbackServices.length : Number(amt) || 0;
    const items = savedLineItems.length > 0
      ? savedLineItems.map(item => {
          const itemAmount = Number(item.amount) || 0;
          const itemDiscount = Number(item.discount) || 0;
          const calculatedFinal = itemAmount - (itemAmount * itemDiscount) / 100;
          return {
            name: item.name,
            amount: itemAmount,
            finalAmount: Number(item.finalAmount ?? calculatedFinal),
          };
        })
      : fallbackServices.map(serviceName => {
          const svc = salonServices.find(s => s.name === serviceName);
          const itemAmount = svc ? Number(svc.price) || 0 : fallbackAmountPerService;
          return {
            name: serviceName,
            amount: itemAmount,
            finalAmount: itemAmount - (itemAmount * (Number(b.discount) || 0)) / 100,
          };
        });

    const lineItems = items.map(item => `• ${item.name} (₹${item.finalAmount.toLocaleString("en-IN")})`).join("\n");
    const subtotalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmountValue = items.reduce((sum, item) => sum + (item.amount - item.finalAmount), 0);
    const finalAmt = b.finalAmount ?? items.reduce((sum, item) => sum + item.finalAmount, 0);
    const discountValue = subtotalAmount > 0 ? Number(((discountAmountValue / subtotalAmount) * 100).toFixed(2)) : 0;

    return {
      customerName: customer?.name || b.customerName || "Customer",
      total: finalAmt,
      subtotal: subtotalAmount,
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
        <Button
          onClick={() => {
            if (open) {
              setOpen(false);
              resetForm();
              return;
            }
            resetForm();
            setOpen(true);
          }}
          className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6"
        >
          <Plus className="h-4 w-4 mr-2" /> {open ? "Close Billing Form" : "Add Billing"}
        </Button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="font-display text-3xl mb-5">{editId ? "Edit Billing" : "New Billing"}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="form-label">Items *</label>
                <Button type="button" variant="outline" onClick={addEmptyService} className="h-9">
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {form.selectedServices.map((service, index) => (
                  <div key={service.id} className="rounded-lg border border-border p-3 bg-muted/30 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto] gap-2 items-end">
                      <div>
                        <label className="form-label">Item {index + 1}</label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(service.id, { name: e.target.value, serviceId: undefined })}
                          placeholder="Enter service/item name"
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="form-label">Amount (₹)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.price}
                          onChange={(e) => updateService(service.id, { price: Number(e.target.value) || 0 })}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="form-label">Discount (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={service.discount}
                          onChange={(e) => updateService(service.id, { discount: Number(e.target.value) || 0 })}
                          className="h-10"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeService(service.id)}
                        className="h-10"
                        disabled={form.selectedServices.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {[0, 5, 10, 15, 20, 25].map(percent => (
                        <Button
                          key={`${service.id}-${percent}`}
                          type="button"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => updateService(service.id, { discount: percent })}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="text-sm text-muted-foreground">Item subtotal</span>
                      <span className="text-sm font-semibold text-accent">₹{getItemSubtotal(service).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Item Discounts</span>
                <span className="text-sm font-medium text-destructive">-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="font-semibold">Final Amount</span>
                <span className="text-lg font-bold text-accent">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div>
                <label className="form-label">Date *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
              {editId ? "Update Billing" : "Add Billing"}
            </Button>
          </form>
        </motion.div>
      )}

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
                    <td className="p-4 font-body text-sm font-semibold text-right">₹{(b.finalAmount ?? parseFloat(String(b.amount))).toFixed(2)}</td>
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
