import { useMemo, useState } from "react";
import { useStore, Appointment as AppointmentType } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const Appointments = () => {
  const { appointments, customers, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerId: "",
    service: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    notes: "",
    status: "scheduled" as "scheduled" | "completed" | "cancelled",
  });

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const first = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const second = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return first - second;
    });
  }, [appointments]);

  const resetForm = () => {
    setForm({
      customerId: "",
      service: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      notes: "",
      status: "scheduled",
    });
    setEditId(null);
  };

  const startEdit = (appointment: AppointmentType) => {
    setForm({
      customerId: appointment.customerId,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time || "10:00",
      notes: appointment.notes || "",
      status: appointment.status,
    });
    setEditId(appointment.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.service || !form.date || !form.time) {
      toast.error("Client, service, date and time are required");
      return;
    }

    const customer = customers.find(c => c.id === form.customerId);
    const payload = {
      customerId: form.customerId,
      customerName: customer?.name || "Unknown",
      service: form.service,
      date: form.date,
      time: form.time,
      notes: form.notes,
      status: form.status,
    };

    if (editId) {
      updateAppointment(editId, payload);
      toast.success("Appointment updated");
    } else {
      addAppointment(payload);
      toast.success("Appointment added");
    }

    resetForm();
    setOpen(false);
  };

  const statusClass = (status: AppointmentType["status"]) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage all client appointments</p>
        </motion.div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20 px-6">
              <Plus className="h-4 w-4 mr-2" /> New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{editId ? "Edit Appointment" : "New Appointment"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="form-label">Client *</label>
                <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.mobile}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="form-label">Service *</label>
                <Input
                  value={form.service}
                  onChange={e => setForm({ ...form, service: e.target.value })}
                  placeholder="Enter service name"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Date *</label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-11" />
                </div>
                <div>
                  <label className="form-label">Time *</label>
                  <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="h-11" />
                </div>
              </div>

              <div>
                <label className="form-label">Status</label>
                <Select value={form.status} onValueChange={(v: "scheduled" | "completed" | "cancelled") => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="form-label">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" className="h-11" />
              </div>

              <Button type="submit" className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20">
                {editId ? "Update Appointment" : "Add Appointment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-body text-sm font-semibold">Date</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Time</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Client</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Service</th>
                <th className="text-left p-4 font-body text-sm font-semibold">Status</th>
                <th className="text-right p-4 font-body text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-accent/10">
                        <CalendarDays className="h-8 w-8 text-accent" />
                      </div>
                      <p className="font-display text-xl text-foreground">No appointments found</p>
                      <p className="text-sm text-muted-foreground">Create your first appointment</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAppointments.map((appointment, index) => (
                  <motion.tr
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors group"
                  >
                    <td className="p-4 font-body text-sm text-muted-foreground">{formatDate(appointment.date)}</td>
                    <td className="p-4 font-body text-sm">{appointment.time}</td>
                    <td className="p-4 font-body text-sm font-medium">{appointment.customerName || customers.find(c => c.id === appointment.customerId)?.name || "Unknown"}</td>
                    <td className="p-4 font-body text-sm">{appointment.service}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-body font-medium ${statusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(appointment)}
                          className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                          title="Edit appointment"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { deleteAppointment(appointment.id); toast.success("Appointment removed"); }}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                          title="Delete appointment"
                        >
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

export default Appointments;
