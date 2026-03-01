import { useState } from "react";
import { useStore, Customer } from "@/store/useStore";
import { Plus, Search, Trash2, Edit2, UserPlus, Phone, Calendar as CalendarIcon, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, deleteCustomer, updateCustomer, memberships, addMembership, updateMembership, membershipPlans } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", date: new Date().toISOString().split("T")[0], birthday: "", anniversary: "", reference: "", notes: "" });
  const [membershipForm, setMembershipForm] = useState({
    customerId: "",
    planId: "",
    plan: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    amount: "",
    advanceAmount: "",
    offerDetails: "",
    totalBenefits: ""
  });

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile) { toast.error("Name and mobile are required"); return; }
    if (!/^\d{10}$/.test(form.mobile)) { toast.error("Mobile number must be exactly 10 digits"); return; }
    if (editId) {
      updateCustomer(editId, form);
      toast.success("Client updated");
      setEditId(null);
    } else {
      addCustomer(form);
      toast.success("Client added successfully");
    }
    setForm({ name: "", mobile: "", date: new Date().toISOString().split("T")[0], birthday: "", anniversary: "", reference: "", notes: "" });
    setOpen(false);
  };

  const startEdit = (c: Customer) => {
    setForm({ name: c.name, mobile: c.mobile, date: c.date, birthday: c.birthday || "", anniversary: c.anniversary || "", reference: c.reference || "", notes: c.notes || "" });
    setEditId(c.id);
    setOpen(true);
  };

  const startMembership = (c: Customer) => {
    setMembershipForm({
      customerId: c.id,
      planId: "",
      plan: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      amount: "",
      advanceAmount: "",
      offerDetails: "",
      totalBenefits: ""
    });
    setMembershipOpen(true);
  };

  const handlePlanSelect = (planId: string) => {
    const plan = membershipPlans.find(p => p.id === planId);
    if (!plan) return;
    setMembershipForm(prev => ({
      ...prev,
      planId,
      plan: plan.name,
      amount: plan.price.toString(),
      totalBenefits: plan.totalBenefits.toString()
    }));
  };

  const handleMembershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipForm.customerId || !membershipForm.plan || !membershipForm.endDate || !membershipForm.amount || !membershipForm.totalBenefits) {
      toast.error("All membership fields are required");
      return;
    }
    const customer = customers.find(c => c.id === membershipForm.customerId);
    const isExpired = new Date(membershipForm.endDate) < new Date();
    const existing = memberships
      .filter(m => m.customerId === membershipForm.customerId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

    const payload = {
      customerId: membershipForm.customerId,
      customerName: customer?.name || "Unknown",
      plan: membershipForm.plan,
      planId: membershipForm.planId || undefined,
      startDate: membershipForm.startDate,
      endDate: membershipForm.endDate,
      amount: parseFloat(membershipForm.amount),
      advanceAmount: parseFloat(membershipForm.advanceAmount) || 0,
      offerDetails: membershipForm.offerDetails,
      totalBenefits: parseInt(membershipForm.totalBenefits) || 0,
      usedBenefits: 0,
      status: (isExpired ? "expired" : "active") as 'active' | 'expired',
    };

    if (existing) {
      updateMembership(existing.id, payload);
      toast.success("Membership updated for client");
    } else {
      addMembership(payload);
      toast.success("Membership assigned to client");
    }

    setMembershipOpen(false);
  };

  const getActiveMembership = (customerId: string) => {
    return memberships.find(m => m.customerId === customerId && new Date(m.endDate) >= new Date());
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{customers.length} total clients registered</p>
        </motion.div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ name: "", mobile: "", date: new Date().toISOString().split("T")[0], birthday: "", anniversary: "", reference: "", notes: "" }); } }}>
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
                <Input type="tel" inputMode="numeric" maxLength={10} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="9876543210" className="h-11" />
              </div>
              <div>
                <label className="form-label">Visit Date</label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Birthday</label>
                  <Input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} className="h-11" />
                </div>
                <div>
                  <label className="form-label">Anniversary</label>
                  <Input type="date" value={form.anniversary} onChange={e => setForm({ ...form, anniversary: e.target.value })} className="h-11" />
                </div>
              </div>
              <div>
                <label className="form-label">Reference (Optional)</label>
                <Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Referred by..." className="h-11" />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes" className="h-11" />
              </div>
              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                {editId ? "Update Client" : "Add Client"}
              </Button>
              {!editId && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 font-body tracking-wider text-sm flex items-center gap-2"
                  onClick={() => {
                    const phone = form.mobile.replace(/[^0-9]/g, "");
                    if (!phone) {
                      toast.error("Enter mobile number first");
                      return;
                    }
                    window.open(`https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}`, "_blank");
                    toast.success("Add this contact to your WhatsApp Broadcast List");
                  }}
                >
                  <Phone className="h-4 w-4" /> Add to WhatsApp Broadcast
                </Button>
              )}
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
                      <span className="text-xs text-muted-foreground font-body">{formatDate(c.date)}</span>
                    </div>
                      {getActiveMembership(c.id) && (
                        <div className="mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body font-medium">
                            {getActiveMembership(c.id)?.plan}
                          </span>
                        </div>
                      )}
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
                  <button onClick={() => startMembership(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted transition-colors text-xs font-body text-muted-foreground hover:text-foreground">
                    <Crown className="h-3.5 w-3.5" /> Membership
                  </button>
                  {getActiveMembership(c.id) && (
                    <button onClick={() => navigate(`/customers/${c.id}/membership`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted transition-colors text-xs font-body text-muted-foreground hover:text-foreground">
                      View Details
                    </button>
                  )}
                  <button onClick={() => { deleteCustomer(c.id); toast.success("Client removed"); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-xs font-body text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={membershipOpen} onOpenChange={(v) => { setMembershipOpen(v); if (!v) { setMembershipForm({ customerId: "", planId: "", plan: "", startDate: new Date().toISOString().split("T")[0], endDate: "", amount: "", advanceAmount: "", offerDetails: "", totalBenefits: "" }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">Assign Membership</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMembershipSubmit} className="space-y-5 mt-4">
            <div>
              <label className="form-label">Customer *</label>
              <Input value={customers.find(c => c.id === membershipForm.customerId)?.name || ""} className="h-11" readOnly />
            </div>
            <div>
              <label className="form-label">Plan *</label>
              <Select value={membershipForm.planId} onValueChange={handlePlanSelect}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select plan..." /></SelectTrigger>
                <SelectContent>
                  {membershipPlans.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {membershipPlans.length === 0 && (
                <p className="text-xs text-muted-foreground font-body mt-1">Create a plan in Memberships page first.</p>
              )}
            </div>
            <div>
              <label className="form-label">Plan Name *</label>
              <Input value={membershipForm.plan} onChange={e => setMembershipForm({ ...membershipForm, plan: e.target.value })} placeholder="Gold, Platinum..." className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Start Date</label>
                <Input type="date" value={membershipForm.startDate} onChange={e => setMembershipForm({ ...membershipForm, startDate: e.target.value })} className="h-11" />
              </div>
              <div>
                <label className="form-label">End Date *</label>
                <Input type="date" value={membershipForm.endDate} onChange={e => setMembershipForm({ ...membershipForm, endDate: e.target.value })} className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Amount (₹) *</label>
                <Input type="number" value={membershipForm.amount} onChange={e => setMembershipForm({ ...membershipForm, amount: e.target.value })} placeholder="5000" className="h-11" />
              </div>
              <div>
                <label className="form-label">Advance (₹)</label>
                <Input type="number" value={membershipForm.advanceAmount} onChange={e => setMembershipForm({ ...membershipForm, advanceAmount: e.target.value })} placeholder="2000" className="h-11" />
              </div>
            </div>
            <div>
              <label className="form-label">Offer Details</label>
              <Input value={membershipForm.offerDetails} onChange={e => setMembershipForm({ ...membershipForm, offerDetails: e.target.value })} placeholder="Example: 12 facial on discounted price" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Total Benefits *</label>
                <Input type="number" value={membershipForm.totalBenefits} onChange={e => setMembershipForm({ ...membershipForm, totalBenefits: e.target.value })} placeholder="10" className="h-11" min="0" />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
              Assign Membership
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
