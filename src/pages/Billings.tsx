import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Search, Plus, DollarSign, Calendar, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Billings = () => {
  const { billings, addBilling, customers, salonServices } = useStore();
  const [open, setOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [servicesOpen, setServicesOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });
  const [form, setForm] = useState({
    customerId: "",
    selectedServices: [] as { id: string; name: string; price: number }[],
    date: new Date().toISOString().split("T")[0]
  });

  const filtered = billings.filter(b => {
    const matchesService = !serviceSearch || b.service.toLowerCase().includes(serviceSearch.toLowerCase());
    const billingDate = new Date(b.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDateRange = billingDate >= startDate && billingDate <= endDate;
    return matchesService && matchesDateRange;
  });

  const totalRevenue = filtered.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  const totalAmount = form.selectedServices.reduce((sum, s) => sum + s.price, 0);

  const addService = (service: { id: string; name: string; price: number }) => {
    if (!form.selectedServices.find(s => s.id === service.id)) {
      setForm({ ...form, selectedServices: [...form.selectedServices, service] });
    }
    setServicesOpen(false);
  };

  const removeService = (serviceId: string) => {
    setForm({
      ...form,
      selectedServices: form.selectedServices.filter(s => s.id !== serviceId)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || form.selectedServices.length === 0) {
      toast.error("Please select client and at least one service");
      return;
    }
    
    const serviceNames = form.selectedServices.map(s => s.name).join(", ");
    addBilling({
      customerId: form.customerId,
      service: serviceNames,
      amount: totalAmount.toString(),
      date: form.date
    });
    toast.success("Billing added successfully");
    setForm({ customerId: "", selectedServices: [], date: new Date().toISOString().split("T")[0] });
    setOpen(false);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Unknown";
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Billings & Services</h1>
          <p className="page-subtitle">Track services and revenue</p>
        </motion.div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Billing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">New Billing</DialogTitle>
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
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
                      <CommandGroup className="max-h-64 overflow-auto">
                        {salonServices.map((service) => (
                          <CommandItem
                            key={service.id}
                            onSelect={() => addService(service)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{service.name}</span>
                              <span className="text-sm text-muted-foreground">₹{service.price}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
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
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-lg font-bold text-accent">₹{totalAmount}</span>
                    </div>
                  </div>
                )}
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
                Add Billing
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
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="h-10 text-sm"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="h-10 text-sm"
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
                <th className="text-right p-4 font-body text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl gold-gradient/10 flex items-center justify-center">
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
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-body text-sm text-muted-foreground">
                      {new Date(b.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-body text-sm font-medium">{getCustomerName(b.customerId)}</td>
                    <td className="p-4 font-body text-sm">{b.service}</td>
                    <td className="p-4 font-body text-sm font-semibold text-right">₹{parseFloat(b.amount).toFixed(2)}</td>
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
