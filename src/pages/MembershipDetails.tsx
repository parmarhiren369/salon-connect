import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type UsageRow = {
  monthKey: string;
  monthLabel: string;
  serviceTaken: boolean;
  usedDate?: string;
  notes?: string;
};

const buildMonthlyRows = (startDate: string, totalBenefits: number, existingRows: UsageRow[] = []): UsageRow[] => {
  const start = new Date(startDate);
  const rows: UsageRow[] = [];

  for (let index = 0; index < Math.max(0, totalBenefits); index += 1) {
    const monthDate = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = monthDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
    const existing = existingRows.find(row => row.monthKey === monthKey);
    rows.push(existing || { monthKey, monthLabel, serviceTaken: false });
  }

  return rows;
};

const MembershipDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { customers, memberships, updateMembership, addAppointment } = useStore();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [nextVisitDate, setNextVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [nextVisitTime, setNextVisitTime] = useState("10:00");

  const customer = customers.find(c => c.id === customerId);

  const membership = useMemo(() => {
    if (!customerId) return undefined;
    return memberships
      .filter(m => m.customerId === customerId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
  }, [memberships, customerId]);

  const rows = useMemo(() => {
    if (!membership) return [];
    return buildMonthlyRows(membership.startDate, membership.totalBenefits ?? 0, membership.monthlyUsage || []);
  }, [membership]);

  const updateRow = (monthKey: string, patch: Partial<UsageRow>) => {
    if (!membership) return;
    const currentRows = buildMonthlyRows(membership.startDate, membership.totalBenefits ?? 0, membership.monthlyUsage || []);
    const nextRows = currentRows.map(row => row.monthKey === monthKey ? { ...row, ...patch } : row);
    const usedBenefits = nextRows.filter(row => row.serviceTaken).length;
    updateMembership(membership.id, {
      monthlyUsage: nextRows,
      usedBenefits,
    });
  };

  const openScheduleDialog = (monthKey: string) => {
    setSelectedRowKey(monthKey);
    setNextVisitDate(new Date().toISOString().split("T")[0]);
    setNextVisitTime("10:00");
    setScheduleOpen(true);
  };

  const handleConfirmTaken = () => {
    if (!membership || !customer || !selectedRowKey) return;
    if (!nextVisitDate || !nextVisitTime) {
      toast.error("Next visit date and time are required");
      return;
    }

    updateRow(selectedRowKey, { serviceTaken: true, usedDate: new Date().toISOString().split("T")[0] });

    addAppointment({
      customerId: customer.id,
      customerName: customer.name,
      date: nextVisitDate,
      time: nextVisitTime,
      service: membership.offerDetails || membership.plan,
      notes: `Next membership benefit for ${membership.plan}`,
      status: "scheduled",
    });

    toast.success("Benefit marked as taken and next appointment added");
    setScheduleOpen(false);
    setSelectedRowKey(null);
  };

  if (!membership || !customer) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="font-display text-xl text-foreground mb-2">Membership details not found</p>
        <Button variant="outline" onClick={() => navigate("/customers")}>Back to Clients</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <Button variant="outline" onClick={() => navigate("/customers")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
          </Button>
          <h1 className="page-title">Membership Usage - {customer.name}</h1>
          <p className="page-subtitle">
            {membership.plan} • {membership.offerDetails || "Membership offer"}
          </p>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-lg font-display font-bold">₹{membership.amount.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Advance Paid</p>
            <p className="text-lg font-display font-bold">₹{(membership.advanceAmount ?? 0).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Benefits Used</p>
            <p className="text-lg font-display font-bold">{membership.usedBenefits ?? 0}/{membership.totalBenefits ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Validity</p>
            <p className="text-sm font-body">{formatDate(membership.startDate)} → {formatDate(membership.endDate)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-body text-sm font-semibold">Month</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Service</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Taken</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Used Date</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Notes</th>
                <th className="text-right p-4 font-body text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-sm text-muted-foreground">No monthly rows available for this membership.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.monthKey} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-body">{row.monthLabel}</td>
                    <td className="p-4 text-sm font-body">{membership.offerDetails || membership.plan}</td>
                    <td className="p-4 text-sm font-body">{row.serviceTaken ? "Yes" : "No"}</td>
                    <td className="p-4 text-sm font-body">{row.usedDate || "—"}</td>
                    <td className="p-4 text-sm font-body min-w-[220px]">
                      <Input
                        value={row.notes || ""}
                        onChange={(e) => updateRow(row.monthKey, { notes: e.target.value })}
                        placeholder="Optional note"
                        className="h-9"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {!row.serviceTaken ? (
                          <button
                            onClick={() => openScheduleDialog(row.monthKey)}
                            className="px-3 py-1.5 rounded-lg text-xs font-body bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Taken
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-body bg-muted text-muted-foreground">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">Next Visit Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="form-label">Next Visit Date *</label>
              <Input type="date" value={nextVisitDate} onChange={(e) => setNextVisitDate(e.target.value)} className="h-11" />
            </div>
            <div>
              <label className="form-label">Next Visit Time *</label>
              <Input type="time" value={nextVisitTime} onChange={(e) => setNextVisitTime(e.target.value)} className="h-11" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button type="button" className="gold-gradient text-accent-foreground hover:opacity-90" onClick={handleConfirmTaken}>
              Save & Mark Taken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipDetails;
