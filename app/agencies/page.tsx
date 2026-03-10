"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  createAgency,
  getAllAgencies,
  updateAgency,
  deleteAgency,
  type ICreateAgencyPayload,
} from "@/actions/agency";
import type { Agency } from "@/models/agency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Users,
  TrendingUp,
  Building2,
  Loader2,
  Percent,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

// ─── Empty form state ─────────────────────────────────────────────
const EMPTY_FORM: ICreateAgencyPayload = {
  name: "",
  email: "",
  password: "",
  address: { city: "", country: "", street: "" },
  contact: { phone: "", contact_email: "" },
  financial_data: { percentage: 10 },
  company_metadata: { name: "", vat: "" },
};

// ─── Form field helper ────────────────────────────────────────────
function Field({
  label,
  id,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input id={id} className="border-gray-300 h-9 text-sm" {...props} />
    </div>
  );
}

export default function AgencyPage() {
  const { toast } = useToast();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [form, setForm] = useState<ICreateAgencyPayload>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────
  const fetchAgencies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllAgencies();
      setAgencies(data ?? []);
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi nje gabim gjate ngarkimit.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  // ─── Form helpers ───────────────────────────────────────────────
  const setField = (path: string, value: string | number) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let ref: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const openCreate = () => {
    setEditingAgency(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  };

  const openEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setForm({
      name: agency.name,
      email: agency.email,
      password: "",
      address: { ...agency.address },
      contact: { ...agency.contact },
      financial_data: { percentage: agency.financial_data?.percentage ?? 10 },
      company_metadata: { ...agency.company_metadata },
    });
    setSheetOpen(true);
  };

  // ─── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Emri dhe email jane te detyrueshme.",
      });
      return;
    }
    if (!editingAgency && !form.password) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Fjalëkalimi është i detyrueshëm.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAgency) {
        const payload = { ...form };
        if (!payload.password) delete (payload as any).password;
        await updateAgency(editingAgency._id, payload);
        toast({
          title: "Sukses",
          description: "Agjencia u perditesua me sukses.",
        });
      } else {
        await createAgency(form);
        toast({ title: "Sukses", description: "Agjencia u krijua me sukses." });
      }
      setSheetOpen(false);
      fetchAgencies();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description:
          err?.response?.data?.message ?? "Ndodhi nje gabim. Provo perseri.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAgency(deleteTarget._id);
      toast({ title: "Sukses", description: "Agjencia u fshi me sukses." });
      setDeleteTarget(null);
      fetchAgencies();
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Gabim ne fshirjen e agjencise.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Filtered list ──────────────────────────────────────────────
  const filtered = agencies.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.address?.city?.toLowerCase().includes(q) ||
      a.address?.country?.toLowerCase().includes(q)
    );
  });

  // ─── Stats ──────────────────────────────────────────────────────
  const totalSales = agencies.reduce(
    (s, a) => s + (a.financial_data?.total_sales ?? 0),
    0,
  );
  const activeCount = agencies.filter((a) => a.is_active).length;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agjensite Partnere
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Menaxho agjensit qe shitne bileta ne emrin tuaj.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-gray-900 text-white hover:bg-gray-800 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Shto Agjenci
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gjithsej Agjenci
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {isLoading ? (
                    <Skeleton className="h-8 w-10 inline-block" />
                  ) : (
                    agencies.length
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 bg-green-50 rounded-xl">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktive
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {isLoading ? (
                    <Skeleton className="h-8 w-10 inline-block" />
                  ) : (
                    activeCount
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 bg-purple-50 rounded-xl">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Shitje
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 inline-block" />
                  ) : (
                    `€${fmt(totalSales)}`
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table card */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Lista e Agjencive
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {filtered.length} agjenci
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kerko agjenci..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-gray-300 h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {search
                    ? "Nuk u gjet asnje agjenci."
                    : "Nuk ka agjenci te regjistruara."}
                </p>
                {!search && (
                  <Button
                    onClick={openCreate}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Shto agjencine e
                    pare
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-100">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Emri
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qyteti
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefoni
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                        Komisioni
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                        Shitjet
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                        Borxhi
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                        Statusi
                      </TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((agency) => (
                      <TableRow
                        key={agency._id}
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 text-sm py-3.5">
                          <div>
                            {agency.name}
                            {agency.company_metadata?.name && (
                              <div className="text-xs text-gray-400 font-normal">
                                {agency.company_metadata.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {agency.email}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {agency.address?.city}
                          {agency.address?.country
                            ? `, ${agency.address.country}`
                            : ""}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 font-mono">
                          {agency.contact?.phone || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                            {agency.financial_data?.percentage ?? 0}
                            <Percent className="h-3 w-3 text-gray-400" />
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-gray-900">
                          €{fmt(agency.financial_data?.total_sales ?? 0)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-red-600">
                          €{fmt(agency.financial_data?.debt ?? 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              agency.is_active
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                            }
                          >
                            {agency.is_active ? "Aktive" : "Joaktive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-900"
                              onClick={() => openEdit(agency)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => setDeleteTarget(agency)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ── Create / Edit Sheet ───────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-gray-900">
              {editingAgency ? "Modifiko Agjencine" : "Shto Agjenci te Re"}
            </SheetTitle>
            <SheetDescription className="text-gray-500 text-sm">
              {editingAgency
                ? "Perditeso te dhenat e agjencise partner."
                : "Krijo nje agjenci te re qe do te shese bileta ne emrin tuaj."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 py-4">
            {/* Basic info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Informacioni Bazë
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Field
                  id="name"
                  label="Emri i Agjencisë"
                  required
                  placeholder="p.sh. TravelZone Prizren"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                <Field
                  id="email"
                  label="Email"
                  required
                  type="email"
                  placeholder="agjencia@email.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
                <Field
                  id="password"
                  label={
                    editingAgency
                      ? "Fjalekalim i ri (lere bosh per te mbajtur)"
                      : "Fjalekalim"
                  }
                  required={!editingAgency}
                  type="password"
                  placeholder={
                    editingAgency ? "••••••••" : "Minimum 8 karaktere"
                  }
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Adresa
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="city"
                  label="Qyteti"
                  placeholder="Prizren"
                  value={form.address.city}
                  onChange={(e) => setField("address.city", e.target.value)}
                />
                <Field
                  id="country"
                  label="Shteti"
                  placeholder="Kosovo"
                  value={form.address.country}
                  onChange={(e) => setField("address.country", e.target.value)}
                />
                <div className="col-span-2">
                  <Field
                    id="street"
                    label="Rruga"
                    placeholder="Rr. Lidhja e Prizrenit 12"
                    value={form.address.street}
                    onChange={(e) => setField("address.street", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Kontakti
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Field
                  id="phone"
                  label="Telefoni"
                  placeholder="+383 44 000 000"
                  value={form.contact.phone}
                  onChange={(e) => setField("contact.phone", e.target.value)}
                />
                <Field
                  id="contact_email"
                  label="Email Kontakti"
                  placeholder="kontakt@agjencia.com"
                  type="email"
                  value={form.contact.contact_email}
                  onChange={(e) =>
                    setField("contact.contact_email", e.target.value)
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Financial */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Te Dhenat Financiare
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="percentage"
                  label="Komisioni (%)"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="10"
                  value={form.financial_data.percentage}
                  onChange={(e) =>
                    setField(
                      "financial_data.percentage",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
                <Field
                  id="vat"
                  label="TVSH / Numri Fiskal"
                  placeholder="800123456"
                  value={form.company_metadata?.vat ?? ""}
                  onChange={(e) =>
                    setField("company_metadata.vat", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t border-gray-100 flex flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              onClick={() => setSheetOpen(false)}
              disabled={isSubmitting}
            >
              Anulo
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingAgency ? "Duke perditesuar..." : "Duke krijuar..."}
                </span>
              ) : editingAgency ? (
                "Ruaj Ndryshimet"
              ) : (
                "Krijo Agjencine"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirm Dialog ─────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Konfirmo Fshirjen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Je i sigurt qe deshiron te fshish agjencine{" "}
              <span className="font-semibold text-gray-900">
                "{deleteTarget?.name}"
              </span>
              ? Ky veprim nuk mund te zhbehet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700">
              Anulo
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Duke fshire...
                </span>
              ) : (
                "Fshi Agjencine"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
