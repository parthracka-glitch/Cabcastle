import React, { useState, useEffect } from "react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, UserCheck, Phone, Shield, Edit2, Trash2, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function DriversManage() {
  const [drivers, setDrivers] = useState([
    {
      id: "drv-1",
      name: "Suresh Gaonkar",
      phone: "+91 98221 45678",
      license_no: "GA-01-2018-004512",
      experience_years: 8,
      assigned_vehicle: "Maruti Baleno AC (GA-01-AB-1234)",
      status: "Available",
      rating: "4.9 ⭐ (128 trips)",
    },
    {
      id: "drv-2",
      name: "Ramesh Naik",
      phone: "+91 98603 88912",
      license_no: "GA-02-2016-009823",
      experience_years: 10,
      assigned_vehicle: "Toyota Innova Crysta (GA-03-CD-5678)",
      status: "On Trip",
      rating: "5.0 ⭐ (214 trips)",
    },
    {
      id: "drv-3",
      name: "Anthony D'Souza",
      phone: "+91 99234 11209",
      license_no: "GA-01-2020-001290",
      experience_years: 5,
      assigned_vehicle: "Swift Dzire (GA-01-EF-9012)",
      status: "Available",
      rating: "4.8 ⭐ (89 trips)",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    license_no: "",
    experience_years: "5",
    assigned_vehicle: "",
    status: "Available",
  });

  // Load from API or Local Storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ccg_admin_drivers");
      if (stored) {
        setDrivers(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveDriversList = (newList) => {
    setDrivers(newList);
    try {
      localStorage.setItem("ccg_admin_drivers", JSON.stringify(newList));
    } catch {}
  };

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setForm({
      name: "",
      phone: "",
      license_no: "",
      experience_years: "5",
      assigned_vehicle: "",
      status: "Available",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (drv) => {
    setEditingDriver(drv);
    setForm({
      name: drv.name,
      phone: drv.phone,
      license_no: drv.license_no,
      experience_years: String(drv.experience_years || 5),
      assigned_vehicle: drv.assigned_vehicle || "",
      status: drv.status || "Available",
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter Driver Name and Phone Number");
      return;
    }

    if (editingDriver) {
      const updated = drivers.map((d) =>
        d.id === editingDriver.id
          ? { ...d, ...form, experience_years: Number(form.experience_years) }
          : d
      );
      saveDriversList(updated);
      toast.success(`Driver ${form.name} updated successfully`);
    } else {
      const newDriver = {
        id: `drv-${Date.now()}`,
        ...form,
        experience_years: Number(form.experience_years),
        rating: "5.0 ⭐ (New Chauffeur)",
      };
      saveDriversList([newDriver, ...drivers]);
      toast.success(`Driver ${form.name} added to roster`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from drivers roster?`)) {
      const updated = drivers.filter((d) => d.id !== id);
      saveDriversList(updated);
      toast.success("Driver removed from roster");
    }
  };

  const handleWhatsAppDriver = (drv) => {
    const text = encodeURIComponent(
      `Hello ${drv.name}, this is Cab Castle Goa Dispatch. Please report for your upcoming tour schedule.`
    );
    window.open(`https://wa.me/${drv.phone.replace(/\D/g, "")}?text=${text}`, "_blank");
  };

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      (d.assigned_vehicle || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[#063247] tracking-tight flex items-center gap-2">
            <UserCheck className="text-[#288DA6]" /> Chauffeurs &amp; Drivers Roster
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Manage your verified Goa cab chauffeurs, vehicle assignments, and trip readiness.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-[#063247] hover:bg-[#063247]/90 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus size={15} className="font-bold stroke-[2.5]" />
          <span>Add New Driver</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#DFE8EC] rounded-2xl p-3 sm:p-4 shadow-2xs">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver name, phone, or assigned cab..."
            className="pl-9.5 h-9 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs rounded-xl focus:border-[#063247] focus:bg-white"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="rounded-2xl border border-[#DFE8EC] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse min-w-[700px]">
            <TableHeader>
              <tr className="bg-[#F8FAFC] border-b border-[#DFE8EC] text-[11px] font-bold text-[#4C606E] uppercase tracking-wider">
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-3">WhatsApp Phone</th>
                <th className="py-3 px-3">Driving License</th>
                <th className="py-3 px-3">Assigned Vehicle</th>
                <th className="py-3 px-3">Rating / Exp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-[#DFE8EC]">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#5A7184] py-12 text-xs font-medium">
                    No drivers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((drv) => (
                  <TableRow key={drv.id} className="border-[#DFE8EC] hover:bg-[#F8FAFC]/80 transition-colors">
                    <TableCell className="whitespace-nowrap py-3.5 px-4">
                      <div className="font-bold text-xs text-[#063247] flex items-center gap-1.5">
                        <UserCheck size={14} className="text-[#288DA6]" />
                        {drv.name}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-3.5 px-3">
                      <span className="font-mono text-xs font-semibold text-[#0E7490]">{drv.phone}</span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-3.5 px-3">
                      <span className="font-mono text-xs text-[#5A7184]">{drv.license_no}</span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-3.5 px-3 text-xs font-semibold text-[#063247]">
                      {drv.assigned_vehicle || "Floating Chauffeur"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-3.5 px-3 text-xs text-[#5A7184]">
                      <div>{drv.rating || "5.0 ⭐"}</div>
                      <div className="text-[10px]">{drv.experience_years} yrs in Goa</div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                          drv.status === "Available"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : drv.status === "On Trip"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {drv.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap py-3.5 pr-4 pl-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleWhatsAppDriver(drv)}
                          className="h-8 px-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer rounded-lg inline-flex items-center gap-1 text-xs font-bold"
                          title="Message Driver on WhatsApp"
                        >
                          <MessageSquare size={13} className="text-emerald-600" />
                          <span className="hidden xl:inline">WhatsApp</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(drv)}
                          className="h-8 w-8 p-0 text-[#063247] hover:bg-[#F8FAFC] cursor-pointer rounded-lg"
                        >
                          <Edit2 size={13} />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(drv.id, drv.name)}
                          className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 cursor-pointer rounded-lg"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Driver Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-white text-[#063247] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-[#063247]">
              {editingDriver ? "Edit Chauffeur Profile" : "Register New Driver"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-2">
            <div>
              <Label className="text-xs font-semibold text-[#4C606E] block mb-1">Driver Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Suresh Gaonkar"
                className="h-10 text-xs border-[#DFE8EC] rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-[#4C606E] block mb-1">WhatsApp Phone *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 98221 45678"
                  className="h-10 text-xs border-[#DFE8EC] rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#4C606E] block mb-1">Experience (Years)</Label>
                <Input
                  type="number"
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                  className="h-10 text-xs border-[#DFE8EC] rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#4C606E] block mb-1">Driving License Number</Label>
              <Input
                value={form.license_no}
                onChange={(e) => setForm({ ...form, license_no: e.target.value })}
                placeholder="e.g. GA-01-2018-004512"
                className="h-10 text-xs border-[#DFE8EC] rounded-xl font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#4C606E] block mb-1">Assigned Cab (Optional)</Label>
              <Input
                value={form.assigned_vehicle}
                onChange={(e) => setForm({ ...form, assigned_vehicle: e.target.value })}
                placeholder="e.g. Maruti Baleno AC (GA-01-AB-1234)"
                className="h-10 text-xs border-[#DFE8EC] rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#4C606E] block mb-1">Current Status</Label>
              <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                <SelectTrigger className="h-10 text-xs border-[#DFE8EC] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] text-xs rounded-xl">
                  <SelectItem value="Available">Available (Ready for Dispatch)</SelectItem>
                  <SelectItem value="On Trip">On Trip</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#063247] hover:bg-[#042433] text-white rounded-xl text-xs font-bold">
                {editingDriver ? "Save Changes" : "Add Driver"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
