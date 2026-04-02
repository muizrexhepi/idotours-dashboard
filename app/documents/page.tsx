"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@/context/user";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  Eye,
  Users,
  Bus,
  ShieldCheck,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────
const DRIVER_DOC_TYPES = [
  "Leja",
  "Pasaporta",
  "Letërnjoftim",
  "Kartëlë tahografis",
  "Licenca",
  "Lekarsko",
];
const BUS_DOC_TYPES = [
  "Libreza",
  "Licenca",
  "Eurostandard",
  "Tepi",
  "Bazhdiranje",
  "6 Mujorshja",
  "6 Mujorshja de kra",
];
const DOZVOLL_DOC_TYPES = ["Dozvoll", "Bazhdiranje"];
const ALARM_OPTIONS = [7, 14, 30, 60, 90];

// ─── Expiry status helpers ────────────────────────────────────────
function getExpiryStatus(validUntil: string, alarmDays: number) {
  const days = differenceInDays(parseISO(validUntil), new Date());
  if (days < 0) return { status: "expired", label: "Skaduar", days };
  if (days <= alarmDays) return { status: "warning", label: `${days}d`, days };
  return {
    status: "ok",
    label: format(parseISO(validUntil), "dd.MM.yyyy"),
    days,
  };
}

function ExpiryBadge({
  validUntil,
  alarmDays,
}: {
  validUntil: string;
  alarmDays: number;
}) {
  const { status, label } = getExpiryStatus(validUntil, alarmDays);
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold gap-1",
        status === "expired" && "bg-red-50 text-red-600 border-red-200",
        status === "warning" && "bg-amber-50 text-amber-600 border-amber-200",
        status === "ok" && "bg-green-50 text-green-700 border-green-200",
      )}
    >
      {status === "expired" && <AlertTriangle className="h-3 w-3" />}
      {status === "warning" && <Clock className="h-3 w-3" />}
      {status === "ok" && <CheckCircle2 className="h-3 w-3" />}
      {label}
    </Badge>
  );
}

// ─── File upload helper ───────────────────────────────────────────
function useFileUpload() {
  const generateUrl = useMutation(api.documents.generateUploadUrl);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<Id<"_storage"> | null> => {
      setUploading(true);
      try {
        const url = await generateUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = await res.json();
        return storageId as Id<"_storage">;
      } catch {
        return null;
      } finally {
        setUploading(false);
      }
    },
    [generateUrl],
  );

  return { uploadFile, uploading };
}

// ─── Generic table header ─────────────────────────────────────────
function DocTableHead({ cols }: { cols: string[] }) {
  return (
    <TableHeader className="bg-gray-50">
      <TableRow className="border-gray-100">
        {cols.map((c) => (
          <TableHead
            key={c}
            className="text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {c}
          </TableHead>
        ))}
        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
          Valid Deri
        </TableHead>
        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
          Alarmi
        </TableHead>
        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
          Foto
        </TableHead>
        <TableHead className="w-16" />
      </TableRow>
    </TableHeader>
  );
}

// ─── Expiry summary pills ─────────────────────────────────────────
function ExpirySummary({
  docs,
}: {
  docs: Array<{ valid_until: string; alarm_days: number }>;
}) {
  const expired = docs.filter(
    (d) => differenceInDays(parseISO(d.valid_until), new Date()) < 0,
  ).length;
  const warning = docs.filter((d) => {
    const days = differenceInDays(parseISO(d.valid_until), new Date());
    return days >= 0 && days <= d.alarm_days;
  }).length;
  const ok = docs.length - expired - warning;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {expired > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
          <AlertTriangle className="h-3 w-3" /> {expired} skaduar
        </span>
      )}
      {warning > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          <Clock className="h-3 w-3" /> {warning} duke skaduar
        </span>
      )}
      {ok > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> {ok} aktive
        </span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB 1 — DRIVER DOCUMENTS
// ════════════════════════════════════════════════════════════════
function DriverDocsTab({ operatorId }: { operatorId: string }) {
  const { toast } = useToast();
  const docs = useQuery(api.documents.getDriverDocuments, {
    operator_id: operatorId,
  });
  const createDoc = useMutation(api.documents.createDriverDocument);
  const deleteDoc = useMutation(api.documents.deleteDriverDocument);
  const { uploadFile, uploading } = useFileUpload();

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Id<"driver_documents"> | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    driver_name: "",
    document_type: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filtered = (docs ?? []).filter(
    (d) =>
      d.driver_name.toLowerCase().includes(search.toLowerCase()) ||
      d.document_type.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!form.driver_name || !form.document_type || !form.valid_until) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso fushat e detyrueshme.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let file_storage_id: Id<"_storage"> | undefined;
      if (selectedFile) {
        const id = await uploadFile(selectedFile);
        if (id) file_storage_id = id;
      }
      await createDoc({ operator_id: operatorId, ...form, file_storage_id });
      toast({ title: "Sukses", description: "Dokumenti u regjistrua." });
      setSheetOpen(false);
      setForm({
        driver_name: "",
        document_type: "",
        valid_until: "",
        alarm_days: 30,
        notes: "",
      });
      setSelectedFile(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <ExpirySummary docs={docs ?? []} />
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kerko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-gray-300 text-sm"
            />
          </div>
          <Button
            onClick={() => setSheetOpen(true)}
            className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> Regjistro
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {docs === undefined ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <FileText className="h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                {search
                  ? "Nuk u gjet asnjë dokument."
                  : "Nuk ka dokumente të regjistruara."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <DocTableHead cols={["Shoferi", "Tipi"]} />
                <TableBody>
                  {filtered.map((doc) => (
                    <TableRow
                      key={doc._id}
                      className="border-gray-100 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-sm font-medium text-gray-900 py-3">
                        {doc.driver_name}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <Badge
                          variant="outline"
                          className="border-gray-200 text-gray-600 text-xs"
                        >
                          {doc.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <ExpiryBadge
                          validUntil={doc.valid_until}
                          alarmDays={doc.alarm_days}
                        />
                      </TableCell>
                      <TableCell className="text-center text-xs text-gray-500">
                        {doc.alarm_days}d
                      </TableCell>
                      <TableCell className="text-center">
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-500 hover:text-blue-700"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                          onClick={() => setDelTarget(doc._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-bold text-gray-900">
              Regjistro Dokument Shoferi
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Shto dokumentin e ri të shoferit.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-2">
            <DocFormField label="Emri i Shoferit *" id="dn">
              <Input
                placeholder="Arben Krasniqi"
                value={form.driver_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, driver_name: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Tipi i Dokumentit *" id="dt">
              <Select
                value={form.document_type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, document_type: v }))
                }
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {DRIVER_DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            <DocFormField label="Valid Deri Me *" id="vu">
              <Input
                type="date"
                value={form.valid_until}
                onChange={(e) =>
                  setForm((p) => ({ ...p, valid_until: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Alarmi (ditë para skadimit)" id="ad">
              <Select
                value={String(form.alarm_days)}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, alarm_days: Number(v) }))
                }
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALARM_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} ditë para
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            <DocFormField label="Skedar (foto/PDF)" id="file">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 gap-1.5 h-9"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> Ngarko
                </Button>
                {selectedFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                    {selectedFile.name}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 ml-1" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </DocFormField>
            <DocFormField label="Shënime" id="notes">
              <Input
                placeholder="Shënime opsionale..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
          </div>
          <SheetFooter className="pt-4 border-t border-gray-100 flex flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              onClick={() => setSheetOpen(false)}
              disabled={isSubmitting || uploading}
            >
              Anulo
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur...
                </span>
              ) : (
                "Regjistro"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <DeleteConfirm
        open={!!delTarget}
        onCancel={() => setDelTarget(null)}
        onConfirm={async () => {
          if (delTarget) {
            await deleteDoc({ id: delTarget });
            setDelTarget(null);
            toast({ title: "U fshi." });
          }
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB 2 — BUS DOCUMENTS
// ════════════════════════════════════════════════════════════════
function BusDocsTab({ operatorId }: { operatorId: string }) {
  const { toast } = useToast();
  const docs = useQuery(api.documents.getBusDocuments, {
    operator_id: operatorId,
  });
  const createDoc = useMutation(api.documents.createBusDocument);
  const deleteDoc = useMutation(api.documents.deleteBusDocument);
  const { uploadFile, uploading } = useFileUpload();

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Id<"bus_documents"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    bus_plates: "",
    bus_serial: "",
    document_type: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filtered = (docs ?? []).filter(
    (d) =>
      d.bus_plates.toLowerCase().includes(search.toLowerCase()) ||
      d.document_type.toLowerCase().includes(search.toLowerCase()) ||
      (d.bus_serial ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!form.bus_plates || !form.document_type || !form.valid_until) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso fushat e detyrueshme.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let file_storage_id: Id<"_storage"> | undefined;
      if (selectedFile) {
        const id = await uploadFile(selectedFile);
        if (id) file_storage_id = id;
      }
      await createDoc({ operator_id: operatorId, ...form, file_storage_id });
      toast({ title: "Sukses", description: "Dokumenti u regjistrua." });
      setSheetOpen(false);
      setForm({
        bus_plates: "",
        bus_serial: "",
        document_type: "",
        valid_until: "",
        alarm_days: 30,
        notes: "",
      });
      setSelectedFile(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <ExpirySummary docs={docs ?? []} />
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kerko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-gray-300 text-sm"
            />
          </div>
          <Button
            onClick={() => setSheetOpen(true)}
            className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> Regjistro
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {docs === undefined ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Bus className="h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                {search
                  ? "Nuk u gjet asnjë dokument."
                  : "Nuk ka dokumente të regjistruara."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <DocTableHead cols={["Bus Tabllat", "Bus Seria", "Tipi"]} />
                <TableBody>
                  {filtered.map((doc) => (
                    <TableRow
                      key={doc._id}
                      className="border-gray-100 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-sm font-medium text-gray-900 font-mono py-3">
                        {doc.bus_plates}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 font-mono">
                        {doc.bus_serial || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <Badge
                          variant="outline"
                          className="border-gray-200 text-gray-600 text-xs"
                        >
                          {doc.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <ExpiryBadge
                          validUntil={doc.valid_until}
                          alarmDays={doc.alarm_days}
                        />
                      </TableCell>
                      <TableCell className="text-center text-xs text-gray-500">
                        {doc.alarm_days}d
                      </TableCell>
                      <TableCell className="text-center">
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-500 hover:text-blue-700"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                          onClick={() => setDelTarget(doc._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-bold text-gray-900">
              Regjistro Dokument Busi
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Shto dokumentin e ri të autobusit.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-2">
            <DocFormField label="Bus Tabllat *" id="bp">
              <Input
                placeholder="MK-AB-123"
                value={form.bus_plates}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bus_plates: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm font-mono"
              />
            </DocFormField>
            <DocFormField label="Bus Seria" id="bs">
              <Input
                placeholder="WDB9066351R....."
                value={form.bus_serial}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bus_serial: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm font-mono"
              />
            </DocFormField>
            <DocFormField label="Tipi i Dokumentit *" id="dt">
              <Select
                value={form.document_type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, document_type: v }))
                }
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {BUS_DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            <DocFormField label="Valid Deri Me *" id="vu">
              <Input
                type="date"
                value={form.valid_until}
                onChange={(e) =>
                  setForm((p) => ({ ...p, valid_until: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Alarmi (ditë para skadimit)" id="ad">
              <Select
                value={String(form.alarm_days)}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, alarm_days: Number(v) }))
                }
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALARM_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} ditë para
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            <DocFormField label="Skedar (foto/PDF)" id="file">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 gap-1.5 h-9"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> Ngarko
                </Button>
                {selectedFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                    {selectedFile.name}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 ml-1" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </DocFormField>
            <DocFormField label="Shënime" id="notes">
              <Input
                placeholder="Shënime opsionale..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
          </div>
          <SheetFooter className="pt-4 border-t border-gray-100 flex flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              onClick={() => setSheetOpen(false)}
              disabled={isSubmitting || uploading}
            >
              Anulo
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur...
                </span>
              ) : (
                "Regjistro"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DeleteConfirm
        open={!!delTarget}
        onCancel={() => setDelTarget(null)}
        onConfirm={async () => {
          if (delTarget) {
            await deleteDoc({ id: delTarget });
            setDelTarget(null);
            toast({ title: "U fshi." });
          }
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB 3 — DOZVOLLAT
// ════════════════════════════════════════════════════════════════
function DozvollatTab({ operatorId }: { operatorId: string }) {
  const { toast } = useToast();
  const docs = useQuery(api.documents.getDozvollat, {
    operator_id: operatorId,
  });
  const createDoc = useMutation(api.documents.createDozvoll);
  const deleteDoc = useMutation(api.documents.deleteDozvoll);
  const { uploadFile, uploading } = useFileUpload();

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Id<"dozvollat"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    document_type: "",
    label: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filtered = (docs ?? []).filter(
    (d) =>
      d.label.toLowerCase().includes(search.toLowerCase()) ||
      d.document_type.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!form.document_type || !form.label || !form.valid_until) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso fushat e detyrueshme.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let file_storage_id: Id<"_storage"> | undefined;
      if (selectedFile) {
        const id = await uploadFile(selectedFile);
        if (id) file_storage_id = id;
      }
      await createDoc({ operator_id: operatorId, ...form, file_storage_id });
      toast({ title: "Sukses", description: "Dozvolla u regjistrua." });
      setSheetOpen(false);
      setForm({
        document_type: "",
        label: "",
        valid_until: "",
        alarm_days: 30,
        notes: "",
      });
      setSelectedFile(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <ExpirySummary docs={docs ?? []} />
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kerko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-gray-300 text-sm"
            />
          </div>
          <Button
            onClick={() => setSheetOpen(true)}
            className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> Regjistro
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {docs === undefined ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <ShieldCheck className="h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                {search
                  ? "Nuk u gjet asnjë dozvoll."
                  : "Nuk ka dozvolla të regjistruara."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-100">
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emërtimi
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipi
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Valid Deri
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Alarmi
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Foto
                    </TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((doc) => (
                    <TableRow
                      key={doc._id}
                      className="border-gray-100 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-sm font-medium text-gray-900 py-3">
                        {doc.label}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <Badge
                          variant="outline"
                          className="border-gray-200 text-gray-600 text-xs"
                        >
                          {doc.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <ExpiryBadge
                          validUntil={doc.valid_until}
                          alarmDays={doc.alarm_days}
                        />
                      </TableCell>
                      <TableCell className="text-center text-xs text-gray-500">
                        {doc.alarm_days}d
                      </TableCell>
                      <TableCell className="text-center">
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-500 hover:text-blue-700"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                          onClick={() => setDelTarget(doc._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-bold text-gray-900">
              Regjistro Dozvoll
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Shto një dozvoll ose leje të re.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-2">
            <DocFormField label="Tipi i Dokumentit *" id="dt">
              <Select
                value={form.document_type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, document_type: v }))
                }
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {DOZVOLL_DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            <DocFormField label="Emërtimi (Etiketa) *" id="lbl">
              <Input
                placeholder="p.sh. Dozvoll Gjermani 2026"
                value={form.label}
                onChange={(e) =>
                  setForm((p) => ({ ...p, label: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Valid Deri Me *" id="vu">
              <Input
                type="date"
                value={form.valid_until}
                onChange={(e) =>
                  setForm((p) => ({ ...p, valid_until: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Alarmi (ditë para skadimit)" id="ad">
              <Select
                value={String(form.alarm_days)}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, alarm_days: Number(v) }))
                }
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALARM_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} ditë para
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            <DocFormField label="Skedar (foto/PDF)" id="file">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 gap-1.5 h-9"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> Ngarko
                </Button>
                {selectedFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                    {selectedFile.name}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 ml-1" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </DocFormField>
            <DocFormField label="Shënime" id="notes">
              <Input
                placeholder="Shënime opsionale..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
          </div>
          <SheetFooter className="pt-4 border-t border-gray-100 flex flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              onClick={() => setSheetOpen(false)}
              disabled={isSubmitting || uploading}
            >
              Anulo
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur...
                </span>
              ) : (
                "Regjistro"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DeleteConfirm
        open={!!delTarget}
        onCancel={() => setDelTarget(null)}
        onConfirm={async () => {
          if (delTarget) {
            await deleteDoc({ id: delTarget });
            setDelTarget(null);
            toast({ title: "U fshi." });
          }
        }}
      />
    </div>
  );
}

// ─── Shared small components ──────────────────────────────────────
function DocFormField({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-gray-600">
        {label}
      </Label>
      {children}
    </div>
  );
}

function DeleteConfirm({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
            <AlertCircle className="h-5 w-5 text-red-500" /> Konfirmo Fshirjen
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500">
            Je i sigurt? Dokumenti dhe skedari do të fshihen përgjithmonë.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300 text-gray-700">
            Anulo
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Fshi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════
export default function DocumentsPage() {
  const { user } = useUser();
  const operatorId: string = user?._id ?? "";

  // Aggregate counts for tab badges
  const driverDocs = useQuery(
    api.documents.getDriverDocuments,
    operatorId ? { operator_id: operatorId } : "skip",
  );
  const busDocs = useQuery(
    api.documents.getBusDocuments,
    operatorId ? { operator_id: operatorId } : "skip",
  );
  const dozvollat = useQuery(
    api.documents.getDozvollat,
    operatorId ? { operator_id: operatorId } : "skip",
  );

  const alertCount = (
    docs: Array<{ valid_until: string; alarm_days: number }> | undefined,
  ) =>
    (docs ?? []).filter(
      (d) =>
        differenceInDays(parseISO(d.valid_until), new Date()) <= d.alarm_days,
    ).length;

  const driverAlerts = alertCount(driverDocs);
  const busAlerts = alertCount(busDocs);
  const dozvollAlerts = alertCount(dozvollat);
  const totalAlerts = driverAlerts + busAlerts + dozvollAlerts;

  if (!operatorId)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumentet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Menaxho dokumentet e shoferëve, autobusëve dhe dozvollat.
          </p>
        </div>
        {totalAlerts > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm font-medium text-amber-800">
              {totalAlerts} dokument{totalAlerts !== 1 ? "e" : ""} duke skaduar
              ose të skaduara
            </p>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Dok. Shoferëve",
            count: driverDocs?.length ?? 0,
            alerts: driverAlerts,
            Icon: Users,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Dok. Busave",
            count: busDocs?.length ?? 0,
            alerts: busAlerts,
            Icon: Bus,
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "Dozvollat",
            count: dozvollat?.length ?? 0,
            alerts: dozvollAlerts,
            Icon: ShieldCheck,
            color: "bg-green-50 text-green-600",
          },
        ].map(({ label, count, alerts, Icon, color }) => (
          <Card key={label} className="border-gray-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${color.split(" ")[0]}`}
              >
                <Icon className={`h-5 w-5 ${color.split(" ")[1]}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 truncate">
                  {label}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  {alerts > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      {alerts}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="bg-gray-100 p-1 h-10 w-full sm:w-auto">
          <TabsTrigger
            value="drivers"
            className="text-sm gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="h-3.5 w-3.5" /> Shoferët
            {driverAlerts > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {driverAlerts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="buses"
            className="text-sm gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Bus className="h-3.5 w-3.5" /> Autobusat
            {busAlerts > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {busAlerts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="dozvollat"
            className="text-sm gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Dozvollat
            {dozvollAlerts > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {dozvollAlerts}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="drivers" className="mt-0">
            <DriverDocsTab operatorId={operatorId} />
          </TabsContent>
          <TabsContent value="buses" className="mt-0">
            <BusDocsTab operatorId={operatorId} />
          </TabsContent>
          <TabsContent value="dozvollat" className="mt-0">
            <DozvollatTab operatorId={operatorId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
