import { useMemo, useState } from "react";
import { useStore, Membership } from "@/store/useStore";
import { Plus, Trash2, Crown, Calendar as CalendarIcon, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const Memberships = () => {
  const {
    memberships,
    addMembership,
    deleteMembership,
    updateMembership,
    customers,
    membershipPlans,
    addMembershipPlan,
    deleteMembershipPlan,
    updateMembershipPlan
  } = useStore();
  const getInitialForm = () => ({
    customerId: "",
    planId: "",
    plan: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    amount: "",
    advanceAmount: "",
    offerDetails: "",
    totalBenefits: "",
    usedBenefits: "0"
  });
  const [showForm, setShowForm] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [planEditId, setPlanEditId] = useState<string | null>(null);
  const [form, setForm] = useState(getInitialForm());
  const [planForm, setPlanForm] = useState({ name: "", price: "", totalBenefits: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.plan || !form.endDate || !form.amount || !form.totalBenefits) { toast.error("All fields are required"); return; }
    const customer = customers.find(c => c.id === form.customerId);
    const isExpired = new Date(form.endDate) < new Date();
    const data = {
      customerId: form.customerId,
      customerName: customer?.name || "Unknown",
      plan: form.plan,
      planId: form.planId || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      amount: parseFloat(form.amount),
      advanceAmount: parseFloat(form.advanceAmount) || 0,
      offerDetails: form.offerDetails,
      totalBenefits: parseInt(form.totalBenefits) || 0,
      usedBenefits: Math.max(0, parseInt(form.usedBenefits) || 0),
      status: (isExpired ? 'expired' : 'active') as 'active' | 'expired',
    };
    if (editId) {
      updateMembership(editId, data);
      toast.success("Membership updated");
    } else {
      addMembership(data);
      toast.success("Membership added");
    }
    setForm(getInitialForm());
    setEditId(null);
    setShowForm(false);
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.price || !planForm.totalBenefits) { toast.error("All plan fields are required"); return; }
    const payload = {
      name: planForm.name,
      price: parseFloat(planForm.price),
      totalBenefits: parseInt(planForm.totalBenefits) || 0
    };
    if (planEditId) {
      updateMembershipPlan(planEditId, payload);
      toast.success("Plan updated");
    } else {
      addMembershipPlan(payload);
      toast.success("Plan created");
    }
    setPlanForm({ name: "", price: "", totalBenefits: "" });
    setPlanEditId(null);
    setPlanOpen(false);
  };

  const startEditMembership = (m: Membership) => {
    setForm({
      customerId: m.customerId,
      planId: m.planId || "",
      plan: m.plan,
      startDate: m.startDate,
      endDate: m.endDate,
      amount: m.amount.toString(),
      advanceAmount: (m.advanceAmount ?? 0).toString(),
      offerDetails: m.offerDetails || "",
      totalBenefits: (m.totalBenefits ?? 0).toString(),
      usedBenefits: (m.usedBenefits ?? 0).toString(),
    });
    setEditId(m.id);
    setShowForm(true);
  };

  const handlePlanSelect = (planId: string) => {
    const plan = membershipPlans.find(p => p.id === planId);
    if (!plan) return;
    setForm(prev => ({
      ...prev,
      planId,
      plan: plan.name,
      amount: plan.price.toString(),
      totalBenefits: plan.totalBenefits.toString(),
    }));
  };

  const active = memberships.filter(m => new Date(m.endDate) >= new Date());
  const expired = memberships.filter(m => new Date(m.endDate) < new Date());

  const planUsageSummary = useMemo(() => {
    return memberships.reduce((acc, m) => acc + (m.usedBenefits ?? 0), 0);
  }, [memberships]);

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Memberships</h1>
          <p className="page-subtitle">{memberships.length} total memberships</p>
        </motion.div>
        <Button
          className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6"
          onClick={() => {
            setEditId(null);
            setForm(getInitialForm());
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Membership
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-8">
          <h2 className="font-display text-3xl mb-5">{editId ? "Edit Membership" : "New Membership"}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Customer *</label>
              <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select customer..." /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="form-label">Plan *</label>
              <Select value={form.planId} onValueChange={handlePlanSelect}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select plan..." /></SelectTrigger>
                <SelectContent>
                  {membershipPlans.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {membershipPlans.length === 0 && (
                <p className="text-xs text-muted-foreground font-body mt-1">Create a plan first to assign memberships.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Start Date</label>
                <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="h-11" />
              </div>
              <div>
                <label className="form-label">End Date *</label>
                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="h-11" />
              </div>
            </div>
            <div>
              <label className="form-label">Amount (₹) *</label>
              <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="5000" className="h-11" />
            </div>
            <div>
              <label className="form-label">Advance Received (₹)</label>
              <Input type="number" value={form.advanceAmount} onChange={e => setForm({ ...form, advanceAmount: e.target.value })} placeholder="2000" className="h-11" />
            </div>
            <div>
              <label className="form-label">Offer Details</label>
              <Input value={form.offerDetails} onChange={e => setForm({ ...form, offerDetails: e.target.value })} placeholder="Example: 12 facials on discounted price" className="h-11" />
            </div>
            <div>
              <label className="form-label">Total Benefits *</label>
              <Input type="number" value={form.totalBenefits} onChange={e => setForm({ ...form, totalBenefits: e.target.value })} placeholder="10" className="h-11" min="0" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" className="h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-8">
                {editId ? "Update Membership" : "Add Membership"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12"
                onClick={() => {
                  setEditId(null);
                  setForm(getInitialForm());
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Membership Plans */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl">Membership Plans</h2>
            <p className="text-xs text-muted-foreground font-body">{membershipPlans.length} plan(s) • {planUsageSummary} benefits used</p>
          </div>
          <Dialog open={planOpen} onOpenChange={(v) => { setPlanOpen(v); if (!v) { setPlanEditId(null); setPlanForm({ name: "", price: "", totalBenefits: "" }); } }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 font-body text-xs"><Plus className="h-4 w-4 mr-2" /> New Plan</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-3xl">{planEditId ? "Edit Plan" : "New Plan"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePlanSubmit} className="space-y-5 mt-4">
                <div>
                  <label className="form-label">Plan Name *</label>
                  <Input value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} placeholder="Gold, Platinum..." className="h-11" />
                </div>
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <Input type="number" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} placeholder="5000" className="h-11" />
                </div>
                <div>
                  <label className="form-label">Total Benefits *</label>
                  <Input type="number" value={planForm.totalBenefits} onChange={e => setPlanForm({ ...planForm, totalBenefits: e.target.value })} placeholder="10" className="h-11" min="0" />
                </div>
                <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                  {planEditId ? "Update Plan" : "Create Plan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {membershipPlans.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground font-body">No plans yet. Create one to start assigning memberships.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {membershipPlans.map(p => (
              <div key={p.id} className="glass-card-hover p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-body font-semibold text-foreground text-sm">{p.name}</h3>
                    <p className="text-xs text-muted-foreground font-body">{p.totalBenefits} benefits</p>
                  </div>
                  <span className="text-lg font-display font-bold text-foreground">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-3">
                  <button
                    onClick={() => { setPlanForm({ name: p.name, price: p.price.toString(), totalBenefits: p.totalBenefits.toString() }); setPlanEditId(p.id); setPlanOpen(true); }}
                    className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => { deleteMembershipPlan(p.id); toast.success("Plan removed"); }}
                    className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {memberships.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <div className="avatar-circle mx-auto mb-4 h-16 w-16">
            <Crown className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="font-display text-xl text-foreground mb-1">No memberships yet</p>
          <p className="font-body text-sm text-muted-foreground">Create membership plans for your loyal clients</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" /> Active ({active.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {active.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
                      className="glass-card-hover p-5 group border-l-4 border-l-green-500/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-body font-semibold text-foreground text-sm">{m.customerName}</h3>
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full gold-gradient text-accent-foreground font-body font-medium">{m.plan}</span>
                        </div>
                        <span className="text-lg font-display font-bold text-foreground">₹{m.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                          <span>Benefits Used</span>
                          <span>{m.usedBenefits ?? 0}/{m.totalBenefits ?? 0}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-accent"
                            style={{ width: `${Math.min(100, ((m.usedBenefits ?? 0) / Math.max(1, (m.totalBenefits ?? 0))) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {formatDate(m.startDate)}</span>
                        <span>→</span>
                        <span>{formatDate(m.endDate)}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap gap-3">
                        <button onClick={() => startEditMembership(m)}
                          className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button onClick={() => { deleteMembership(m.id); toast.success("Membership removed"); }}
                          className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {expired.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Expired ({expired.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {expired.map((m, i) => (
                  <div key={m.id} className="glass-card p-5 opacity-60 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-body font-semibold text-foreground text-sm">{m.customerName}</h3>
                        <span className="text-xs text-muted-foreground font-body">{m.plan}</span>
                      </div>
                      <span className="text-lg font-display font-bold text-muted-foreground">₹{m.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
                      <span>{formatDate(m.startDate)}</span>
                      <span>→</span>
                      <span>{formatDate(m.endDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Memberships;
