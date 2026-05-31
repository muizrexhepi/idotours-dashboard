"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  createAgency,
  getAllAgencies,
  updateAgency,
  deleteAgency,
  getAgencyMonthlyReport,
  payAgencyMonthlyDebt,
  toggleAgencyStatus,
  type ICreateAgencyPayload,
  type IMonthlyDebtReport,
} from "@/actions/agency";
import type { Agency } from "@/models/agency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Receipt,
  CheckCircle2,
  Printer,
  Calendar,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const MONTH_NAMES = [
  "",
  "Janar",
  "Shkurt",
  "Mars",
  "Prill",
  "Maj",
  "Qershor",
  "Korrik",
  "Gusht",
  "Shtator",
  "Tetor",
  "Nentor",
  "Dhjetor",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);

const EMPTY_FORM: ICreateAgencyPayload = {
  name: "",
  email: "",
  password: "",
  address: { city: "", country: "", street: "" },
  contact: { phone: "", contact_email: "" },
  financial_data: { percentage: 10 },
  company_metadata: { name: "", vat: "", logo: "" },
};

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

function printDebtReceipt(
  agency: Agency,
  row: IMonthlyDebtReport,
  refCode: string,
) {
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  const dateStr = new Date().toLocaleDateString("sq", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Fletpagesa - ${agency.name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:40px;background:#fff}
      .logo-area{text-align:center;border-bottom:3px solid #1e40af;padding-bottom:16px;margin-bottom:24px}
      .logo-area h1{font-size:26px;font-weight:900;letter-spacing:1px;color:#111;text-transform:uppercase}
      .logo-area p{font-size:11px;color:#666;margin-top:2px}
      .title-band{background:#1e40af;color:#fff;text-align:center;font-size:20px;font-weight:700;letter-spacing:2px;padding:10px 0;margin-bottom:24px}
      .meta-row{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px}
      .meta-row div{display:flex;flex-direction:column;gap:4px}
      .meta-label{color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
      .meta-value{font-weight:600;color:#111}
      .section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1e40af;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:12px;margin-top:20px}
      table{width:100%;border-collapse:collapse}
      thead tr{background:#1e40af}
      th{color:#fff;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
      td{padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}
      .total-row td{font-weight:700;background:#f9fafb;border-top:2px solid #e5e7eb}
      .status-paid{display:inline-block;background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:.04em}
      .sign-area{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:56px}
      .sign-box{border-top:1px solid #374151;padding-top:8px}
      .sign-label{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em}
      .sign-name{font-size:12px;font-weight:600;color:#111;margin-top:2px}
      .footer{margin-top:32px;text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:12px}
      .paid-stamp{position:fixed;top:80px;right:40px;border:4px solid #16a34a;color:#16a34a;padding:8px 18px;font-size:24px;font-weight:900;transform:rotate(-15deg);opacity:.15;letter-spacing:3px;pointer-events:none}
      @media print{body{padding:20px}.paid-stamp{position:absolute}}
    </style>
  </head><body>
    <div class="paid-stamp">E PAGUAR</div>
    <div class="logo-area">
      <h1>${agency.name}</h1>
      <p>Travel Agency${agency.address?.city ? ` &bull; ${agency.address.city}` : ""}${agency.address?.country ? `, ${agency.address.country}` : ""}</p>
    </div>
    <div class="title-band">FLETPAGESA</div>
    <div class="meta-row">
      <div><span class="meta-label">Data e Lëshimit</span><span class="meta-value">${dateStr}</span></div>
      <div style="text-align:right"><span class="meta-label">Referenca</span><span class="meta-value">${refCode}</span></div>
    </div>
    <div class="section-title">Detajet e Pagesës</div>
    <table>
      <thead><tr>
        <th>Periudha</th><th>Agjencia</th><th style="text-align:center">Rezervime</th>
        <th style="text-align:right">Total Shitje</th>
        <th style="text-align:right">Komisioni (${agency.financial_data?.percentage ?? 0}%)</th>
        <th style="text-align:right">Borxhi</th>
      </tr></thead>
      <tbody>
        <tr>
          <td><strong>${MONTH_NAMES[row.month]} ${row.year}</strong></td>
          <td>${agency.name}</td>
          <td style="text-align:center">${row.booking_count}</td>
          <td style="text-align:right">€${fmt(row.total_sales)}</td>
          <td style="text-align:right;color:#16a34a">€${fmt(row.profit)}</td>
          <td style="text-align:right;color:#dc2626;font-weight:700">€${fmt(row.debt)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="5" style="text-align:right">Shuma e Paguar:</td>
          <td style="text-align:right;color:#16a34a;font-size:15px">€${fmt(row.debt)}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top:16px;display:flex;align-items:center;gap:8px">
      <span class="status-paid">&#10003; E PAGUAR</span>
      <span style="font-size:11px;color:#6b7280">${dateStr}</span>
    </div>
    <div class="sign-area">
      <div class="sign-box">
        <div class="sign-label">Nënshkrimi dhe Vula</div>
        <div class="sign-name">Operatori</div>
        <div style="height:52px"></div>
      </div>
      <div class="sign-box">
        <div class="sign-label">Nënshkrimi i Klientit</div>
        <div class="sign-name">${agency.name}</div>
        <div style="height:52px"></div>
      </div>
    </div>
    <div class="footer">Gjeneruar automatikisht &bull; ${new Date().toLocaleString("sq")} &bull; Ref: ${refCode}</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}

function AgencyFormFields({
  form,
  setField,
  editingAgency,
}: {
  form: ICreateAgencyPayload;
  setField: (path: string, value: string | number) => void;
  editingAgency: Agency | null;
}) {
  return (
    <div className="flex flex-col gap-6 py-4">
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
            onChange={(e) =>
              setField("name", (e.target as HTMLInputElement).value)
            }
          />
          <Field
            id="email"
            label="Email"
            required
            type="email"
            placeholder="agjencia@email.com"
            value={form.email}
            onChange={(e) =>
              setField("email", (e.target as HTMLInputElement).value)
            }
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
            placeholder={editingAgency ? "••••••••" : "Minimum 8 karaktere"}
            value={form.password}
            onChange={(e) =>
              setField("password", (e.target as HTMLInputElement).value)
            }
          />
        </div>
      </div>
      <Separator />
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
            onChange={(e) =>
              setField("address.city", (e.target as HTMLInputElement).value)
            }
          />
          <Field
            id="country"
            label="Shteti"
            placeholder="Kosovo"
            value={form.address.country}
            onChange={(e) =>
              setField("address.country", (e.target as HTMLInputElement).value)
            }
          />
          <div className="col-span-2">
            <Field
              id="street"
              label="Rruga"
              placeholder="Rr. Lidhja e Prizrenit 12"
              value={form.address.street}
              onChange={(e) =>
                setField("address.street", (e.target as HTMLInputElement).value)
              }
            />
          </div>
        </div>
      </div>
      <Separator />
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
            onChange={(e) =>
              setField("contact.phone", (e.target as HTMLInputElement).value)
            }
          />
          <Field
            id="contact_email"
            label="Email Kontakti"
            placeholder="kontakt@agjencia.com"
            type="email"
            value={form.contact.contact_email}
            onChange={(e) =>
              setField(
                "contact.contact_email",
                (e.target as HTMLInputElement).value,
              )
            }
          />
        </div>
      </div>
      <Separator />
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
                parseFloat((e.target as HTMLInputElement).value) || 0,
              )
            }
          />
          <Field
            id="vat"
            label="TVSH / Numri Fiskal"
            placeholder="800123456"
            value={form.company_metadata?.vat ?? ""}
            onChange={(e) =>
              setField(
                "company_metadata.vat",
                (e.target as HTMLInputElement).value,
              )
            }
          />
          <Field
            id="agency_logo"
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            value={form.company_metadata?.logo ?? ""}
            onChange={(e) =>
              setField(
                "company_metadata.logo",
                (e.target as HTMLInputElement).value,
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function AgencyPage() {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [debtReport, setDebtReport] = useState<IMonthlyDebtReport[]>([]);
  const [debtLoading, setDebtLoading] = useState(false);
  const [payingRow, setPayingRow] = useState<string | null>(null);
  const [paidRows, setPaidRows] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [form, setForm] = useState<ICreateAgencyPayload>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openDebtView = async (agency: Agency) => {
    setSelectedAgency(agency);
    setDebtLoading(true);
    setPaidRows(new Set());
    try {
      const data = await getAgencyMonthlyReport(agency._id);
      setDebtReport(data ?? []);
    } finally {
      setDebtLoading(false);
    }
  };

  const handlePayMonth = async (agency: Agency, row: IMonthlyDebtReport) => {
    const key = `${row.year}-${row.month}`;
    setPayingRow(key);
    try {
      await payAgencyMonthlyDebt(agency._id, row.year, row.month);
      setPaidRows((prev) => new Set(Array.from(prev).concat(key)));
      toast({
        title: "Sukses",
        description: `Borxhi për ${MONTH_NAMES[row.month]} ${row.year} u shlye.`,
      });
      const refCode = `RF${row.year}${String(row.month).padStart(2, "0")}-${agency._id.slice(-4).toUpperCase()}`;
      printDebtReceipt(agency, row, refCode);
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi nje gabim. Provo perseri.",
      });
    } finally {
      setPayingRow(null);
    }
  };

  const handleToggleActive = async (agency: Agency) => {
    setTogglingId(agency._id);
    try {
      await toggleAgencyStatus(agency._id, !agency.is_active);
      setAgencies((prev) =>
        prev.map((a) =>
          a._id === agency._id ? { ...a, is_active: !a.is_active } : a,
        ),
      );
      if (selectedAgency?._id === agency._id)
        setSelectedAgency((prev) =>
          prev ? { ...prev, is_active: !prev.is_active } : null,
        );
      toast({
        title: !agency.is_active
          ? "Agjencia u aktivizua"
          : "Agjencia u çaktivizua",
        description: agency.name,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi nje gabim.",
      });
    } finally {
      setTogglingId(null);
    }
  };

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
        const p = { ...form };
        if (!p.password) delete (p as any).password;
        await updateAgency(editingAgency._id, p);
        toast({ title: "Sukses", description: "Agjencia u perditesua." });
      } else {
        await createAgency(form);
        toast({ title: "Sukses", description: "Agjencia u krijua." });
      }
      setSheetOpen(false);
      fetchAgencies();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: err?.response?.data?.message ?? "Ndodhi nje gabim.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAgency(deleteTarget._id);
      toast({ title: "Sukses", description: "Agjencia u fshi." });
      setDeleteTarget(null);
      if (selectedAgency?._id === deleteTarget._id) setSelectedAgency(null);
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

  const filtered = agencies.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.address?.city?.toLowerCase().includes(q) ||
      a.address?.country?.toLowerCase().includes(q)
    );
  });
  const totalSales = agencies.reduce(
    (s, a) => s + (a.financial_data?.total_sales ?? 0),
    0,
  );
  const activeCount = agencies.filter((a) => a.is_active).length;

  // ── DEBT DETAIL VIEW ──────────────────────────────────────────
  if (selectedAgency) {
    const totalDebt = debtReport.reduce(
      (s, r) => s + (paidRows.has(`${r.year}-${r.month}`) ? 0 : (r.debt ?? 0)),
      0,
    );
    const totalSalesD = debtReport.reduce(
      (s, r) => s + (r.total_sales ?? 0),
      0,
    );
    const totalProfit = debtReport.reduce((s, r) => s + (r.profit ?? 0), 0);
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-gray-900 border border-gray-200"
              onClick={() => setSelectedAgency(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedAgency.name}
                </h1>
                <Badge
                  variant="outline"
                  className={
                    selectedAgency.is_active
                      ? "bg-green-50 text-green-700 border-green-200 text-xs"
                      : "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                  }
                >
                  {selectedAgency.is_active ? "Aktive" : "Joaktive"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedAgency.email} &bull; Komisioni:{" "}
                {selectedAgency.financial_data?.percentage ?? 0}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 gap-1.5"
              onClick={() => handleToggleActive(selectedAgency)}
              disabled={togglingId === selectedAgency._id}
            >
              {togglingId === selectedAgency._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selectedAgency.is_active ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
              {selectedAgency.is_active ? "Çaktivizo" : "Aktivizo"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 gap-1.5"
              onClick={() => openEdit(selectedAgency)}
            >
              <Pencil className="h-3.5 w-3.5" /> Modifiko
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Shitje",
              value: `€${fmt(totalSalesD)}`,
              color: "bg-blue-50 text-blue-600",
              Icon: ShoppingBag,
            },
            {
              label: "Komisioni",
              value: `€${fmt(totalProfit)}`,
              color: "bg-green-50 text-green-600",
              Icon: TrendingUp,
            },
            {
              label: "Borxhi Aktual",
              value: `€${fmt(totalDebt)}`,
              color: "bg-red-50 text-red-500",
              Icon: AlertCircle,
            },
            {
              label: "Muaj Raportues",
              value: debtReport.length,
              color: "bg-purple-50 text-purple-600",
              Icon: Calendar,
            },
          ].map(({ label, value, color, Icon }) => (
            <Card key={label} className="border-gray-200 shadow-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${color.split(" ")[0]}`}
                >
                  <Icon className={`h-5 w-5 ${color.split(" ")[1]}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">
              Raporti Mujor i Borxhit
            </CardTitle>
            <CardDescription>
              Kliko &quot;Shëno si Paguar&quot; per te shlyer borxhin e muajit
              — fatura printohet automatikisht
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {debtLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : debtReport.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Receipt className="h-10 w-10 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">
                  Nuk ka te dhena financiare per kete agjenci.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="border-gray-100">
                        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Muaji
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Rezervime
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          Total Shitje
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          Komisioni
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                          Borxhi
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Statusi
                        </TableHead>
                        <TableHead className="w-44" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debtReport.map((row) => {
                        const key = `${row.year}-${row.month}`;
                        const isPaid = paidRows.has(key);
                        const isPaying = payingRow === key;
                        return (
                          <TableRow
                            key={key}
                            className={`border-gray-100 transition-colors ${isPaid ? "bg-green-50/40" : "hover:bg-gray-50/50"}`}
                          >
                            <TableCell className="text-sm font-semibold text-gray-900 py-3.5">
                              {MONTH_NAMES[row.month]}
                              <span className="text-xs text-gray-400 font-normal ml-1.5">
                                {row.year}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-600">
                              {row.booking_count}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold text-gray-900">
                              €{fmt(row.total_sales)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold text-green-600">
                              €{fmt(row.profit)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-bold text-red-600">
                              {isPaid ? (
                                <span className="line-through text-gray-400">
                                  €{fmt(row.debt)}
                                </span>
                              ) : (
                                `€${fmt(row.debt)}`
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {isPaid ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-xs gap-1"
                                >
                                  <CheckCircle2 className="h-3 w-3" /> I Paguar
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-600 border-red-200 text-xs"
                                >
                                  I Papaguar
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {isPaid ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-gray-500 hover:text-gray-700 gap-1.5 h-7"
                                  onClick={() => {
                                    const ref = `RF${row.year}${String(row.month).padStart(2, "0")}-${selectedAgency._id.slice(-4).toUpperCase()}`;
                                    printDebtReceipt(selectedAgency, row, ref);
                                  }}
                                >
                                  <Printer className="h-3.5 w-3.5" /> Printo
                                  Faturën
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5 h-7 text-xs"
                                  disabled={isPaying}
                                  onClick={() =>
                                    handlePayMonth(selectedAgency, row)
                                  }
                                >
                                  {isPaying ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                                      Duke paguar...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                      Shëno si Paguar
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Totali
                  </p>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Shitjet</p>
                      <p className="text-sm font-bold text-gray-900">
                        €{fmt(totalSalesD)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Komisioni</p>
                      <p className="text-sm font-bold text-green-600">
                        €{fmt(totalProfit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Borxhi Aktual</p>
                      <p className="text-lg font-bold text-red-600">
                        €{fmt(totalDebt)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-lg font-bold text-gray-900">
                Modifiko Agjencine
              </SheetTitle>
              <SheetDescription className="text-gray-500 text-sm">
                Perditeso te dhenat e agjencise partner.
              </SheetDescription>
            </SheetHeader>
            <AgencyFormFields
              form={form}
              setField={setField}
              editingAgency={editingAgency}
            />
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Duke
                    perditesuar...
                  </span>
                ) : (
                  "Ruaj Ndryshimet"
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-8">
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
            <Plus className="h-4 w-4 mr-2" /> Shto Agjenci
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Gjithsej Agjenci",
              value: agencies.length,
              Icon: Building2,
              c: "bg-blue-50 text-blue-600",
            },
            {
              label: "Aktive",
              value: activeCount,
              Icon: Users,
              c: "bg-green-50 text-green-600",
            },
            {
              label: "Total Shitje",
              value: `€${fmt(totalSales)}`,
              Icon: TrendingUp,
              c: "bg-purple-50 text-purple-600",
            },
          ].map(({ label, value, Icon, c }) => (
            <Card key={label} className="border-gray-200 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${c.split(" ")[0]}`}>
                  <Icon className={`h-5 w-5 ${c.split(" ")[1]}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 inline-block" />
                    ) : (
                      value
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Lista e Agjencive
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {filtered.length} agjenci &bull; Kliko rreshtin per te parë
                  borxhet
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
                        Aktive
                      </TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((agency) => (
                      <TableRow
                        key={agency._id}
                        className="border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => openDebtView(agency)}
                      >
                        <TableCell className="font-medium text-gray-900 text-sm py-3.5">
                          <div className="flex items-center gap-1.5">
                            {agency.name}
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                          </div>
                          {agency.company_metadata?.name && (
                            <div className="text-xs text-gray-400 font-normal">
                              {agency.company_metadata.name}
                            </div>
                          )}
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
                        <TableCell className="text-right text-sm font-bold text-red-600">
                          €{fmt(agency.financial_data?.debt ?? 0)}
                        </TableCell>
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Switch
                            checked={!!agency.is_active}
                            disabled={togglingId === agency._id}
                            onCheckedChange={() => handleToggleActive(agency)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
          <AgencyFormFields
            form={form}
            setField={setField}
            editingAgency={editingAgency}
          />
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
              <AlertCircle className="h-5 w-5 text-red-500" /> Konfirmo Fshirjen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Je i sigurt qe deshiron te fshish agjencine{" "}
              <span className="font-semibold text-gray-900">
                &quot;{deleteTarget?.name}&quot;
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
