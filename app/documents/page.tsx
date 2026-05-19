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
  ArrowLeft,
  Pencil,
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

function DriverDocsTab({ operatorId }: { operatorId: string }) {
  const { toast } = useToast();
  const docs = useQuery(api.documents.getDriverDocuments, {
    operator_id: operatorId,
  });
  const createDoc = useMutation(api.documents.createDriverDocument);
  const updateDoc = useMutation(api.documents.updateDriverDocument);
  const deleteDoc = useMutation(api.documents.deleteDriverDocument);
  const { uploadFile, uploading } = useFileUpload();

  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Id<"driver_documents"> | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    driver_name: "",
    document_type: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    driver_name: "",
    document_type: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [customType, setCustomType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const grouped = (docs ?? []).reduce((acc, doc) => {
    const name = doc.driver_name;
    if (!acc[name]) {
      acc[name] = { name, docs: [] };
    }
    acc[name]?.docs?.push(doc);
    return acc;
  }, {} as Record<string, { name: string; docs: typeof docs }>);

  const driverList = Object.values(grouped).filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const driverDocs = selectedDriver ? grouped[selectedDriver]?.docs ?? [] : [];
  const filteredDocs = driverDocs.filter((d) =>
    d.document_type.toLowerCase().includes(search.toLowerCase())
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
    const finalDocType = form.document_type === "Tjetër" ? customType : form.document_type;
    if (!finalDocType) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso emrin e dokumentit të personalizuar.",
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
      await createDoc({
        operator_id: operatorId,
        driver_name: form.driver_name,
        document_type: finalDocType,
        valid_until: form.valid_until,
        alarm_days: form.alarm_days,
        notes: form.notes,
        file_storage_id,
      });
      toast({ title: "Sukses", description: "Dokumenti u regjistrua." });
      setSheetOpen(false);
      setForm({
        driver_name: "",
        document_type: "",
        valid_until: "",
        alarm_days: 30,
        notes: "",
      });
      setCustomType("");
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

  const handleEditSubmit = async () => {
    if (!editForm.driver_name || !editForm.document_type || !editForm.valid_until) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso fushat e detyrueshme.",
      });
      return;
    }
    const finalDocType = editForm.document_type === "Tjetër" ? customType : editForm.document_type;
    if (!finalDocType) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso emrin e dokumentit të personalizuar.",
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
      await updateDoc({
        id: editTarget._id,
        driver_name: editForm.driver_name,
        document_type: finalDocType,
        valid_until: editForm.valid_until,
        alarm_days: editForm.alarm_days,
        notes: editForm.notes,
        file_storage_id,
      });
      toast({ title: "Sukses", description: "Dokumenti u përditësua." });
      setEditSheetOpen(false);
      setEditTarget(null);
      setCustomType("");
      setSelectedFile(null);
      if (selectedDriver && selectedDriver !== editForm.driver_name) {
        setSelectedDriver(editForm.driver_name);
      }
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

  const handleOpenEdit = (doc: any) => {
    const isCustom = !DRIVER_DOC_TYPES.includes(doc.document_type);
    setEditTarget(doc);
    setEditForm({
      driver_name: doc.driver_name,
      document_type: isCustom ? "Tjetër" : doc.document_type,
      valid_until: doc.valid_until,
      alarm_days: doc.alarm_days,
      notes: doc.notes || "",
    });
    setCustomType(isCustom ? doc.document_type : "");
    setSelectedFile(null);
    setEditSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <ExpirySummary docs={docs ?? []} />
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={selectedDriver ? "Kërko dokument..." : "Kërko shofer..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-gray-300 text-sm"
            />
          </div>
          <Button
            onClick={() => {
              setForm({
                driver_name: selectedDriver || "",
                document_type: "",
                valid_until: "",
                alarm_days: 30,
                notes: "",
              });
              setCustomType("");
              setSelectedFile(null);
              setSheetOpen(true);
            }}
            className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> Regjistro
          </Button>
        </div>
      </div>

      {docs === undefined ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      ) : !selectedDriver ? (
        driverList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white rounded-xl border border-gray-200">
            <Users className="h-10 w-10 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              {search ? "Nuk u gjet asnjë shofer." : "Nuk ka shoferë të regjistruar."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driverList.map((driver) => {
              const driverExpired = driver?.docs?.filter(
                (d: any) => differenceInDays(parseISO(d.valid_until), new Date()) < 0
              ).length;
              const driverWarning = driver?.docs?.filter((d: any) => {
                const days = differenceInDays(parseISO(d.valid_until), new Date());
                return days >= 0 && days <= d.alarm_days;
              }).length;

              return (
                <Card
                  key={driver.name}
                  className="border-gray-200 shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedDriver(driver.name);
                    setSearch("");
                  }}
                >
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {driver.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{driver.name}</h3>
                        <p className="text-xs text-gray-500">{driver.docs.length} dokumente</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {driverExpired > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> {driverExpired} skaduar
                        </span>
                      ) : null}
                      {driverWarning > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <Clock className="h-3 w-3" /> {driverWarning} paralajmërim
                        </span>
                      ) : null}
                      {driverExpired === 0 && driverWarning === 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Në rregull
                        </span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedDriver(null);
                  setSearch("");
                }}
                className="h-8 w-8 text-gray-500 hover:text-gray-950"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{selectedDriver}</h2>
                <p className="text-xs text-gray-500">Dokumentet e shoferit</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setForm({
                  driver_name: selectedDriver,
                  document_type: "",
                  valid_until: "",
                  alarm_days: 30,
                  notes: "",
                });
                setCustomType("");
                setSelectedFile(null);
                setSheetOpen(true);
              }}
              size="sm"
              className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Shto Dokument
            </Button>
          </div>

          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white">
                  <FileText className="h-10 w-10 text-gray-200" />
                  <p className="text-sm font-medium text-gray-500">
                    {search ? "Nuk u gjet asnjë dokument." : "Nuk ka dokumente për këtë shofer."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <DocTableHead cols={["Tipi", "Shënime"]} />
                    <TableBody>
                      {filteredDocs.map((doc) => (
                        <TableRow
                          key={doc._id}
                          className="border-gray-100 hover:bg-gray-50/50"
                        >
                          <TableCell className="text-sm font-semibold text-gray-900 py-3">
                            <Badge
                              variant="outline"
                              className="border-gray-200 bg-gray-50 text-gray-750 text-xs"
                            >
                              {doc.document_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                            {doc.notes || "—"}
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
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-gray-900"
                                onClick={() => handleOpenEdit(doc)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-red-600"
                                onClick={() => setDelTarget(doc._id)}
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
        </div>
      )}

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
                onValueChange={(v) => {
                  setForm((p) => ({ ...p, document_type: v }));
                  if (v !== "Tjetër") setCustomType("");
                }}
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {[...DRIVER_DOC_TYPES, "Tjetër"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            {form.document_type === "Tjetër" && (
              <DocFormField label="Emri i Dokumentit të ri *" id="custom-type">
                <Input
                  placeholder="p.sh. Certifikatë..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="border-gray-350 h-9 text-sm"
                />
              </DocFormField>
            )}
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

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-bold text-gray-900">
              Ndrysho Dokument Shoferi
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Përditëso detajet e dokumentit të shoferit.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-2">
            <DocFormField label="Emri i Shoferit *" id="edit-dn">
              <Input
                placeholder="Arben Krasniqi"
                value={editForm.driver_name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, driver_name: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Tipi i Dokumentit *" id="edit-dt">
              <Select
                value={editForm.document_type}
                onValueChange={(v) => {
                  setEditForm((p) => ({ ...p, document_type: v }));
                  if (v !== "Tjetër") setCustomType("");
                }}
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {[...DRIVER_DOC_TYPES, "Tjetër"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            {editForm.document_type === "Tjetër" && (
              <DocFormField label="Emri i Dokumentit të ri *" id="edit-custom-type">
                <Input
                  placeholder="p.sh. Certifikatë..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="border-gray-300 h-9 text-sm"
                />
              </DocFormField>
            )}
            <DocFormField label="Valid Deri Me *" id="edit-vu">
              <Input
                type="date"
                value={editForm.valid_until}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, valid_until: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Alarmi (ditë para skadimit)" id="edit-ad">
              <Select
                value={String(editForm.alarm_days)}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, alarm_days: Number(v) }))
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
            <DocFormField label="Skedar (foto/PDF)" id="edit-file">
              <div className="flex flex-col gap-2">
                {editTarget?.file_url && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs">
                    <span className="text-blue-700 font-medium truncate max-w-[200px]">
                      Skedari ekzistues
                    </span>
                    <a
                      href={editTarget.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Shiko
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 gap-1.5 h-9"
                    onClick={() => editFileRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Ngarko të ri
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                      {selectedFile.name}
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (editFileRef.current) editFileRef.current.value = "";
                        }}
                      >
                        <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 ml-1" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            </DocFormField>
            <DocFormField label="Shënime" id="edit-notes">
              <Input
                placeholder="Shënime opsionale..."
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
          </div>
          <SheetFooter className="pt-4 border-t border-gray-100 flex flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              onClick={() => {
                setEditSheetOpen(false);
                setEditTarget(null);
                setSelectedFile(null);
              }}
              disabled={isSubmitting || uploading}
            >
              Anulo
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleEditSubmit}
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Duke përditësuar...
                </span>
              ) : (
                "Ruaj Ndryshimet"
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

function BusDocsTab({ operatorId }: { operatorId: string }) {
  const { toast } = useToast();
  const docs = useQuery(api.documents.getBusDocuments, {
    operator_id: operatorId,
  });
  const createDoc = useMutation(api.documents.createBusDocument);
  const updateDoc = useMutation(api.documents.updateBusDocument);
  const deleteDoc = useMutation(api.documents.deleteBusDocument);
  const { uploadFile, uploading } = useFileUpload();

  const [search, setSearch] = useState("");
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Id<"bus_documents"> | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    bus_plates: "",
    bus_serial: "",
    document_type: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    bus_plates: "",
    bus_serial: "",
    document_type: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [customType, setCustomType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const grouped = (docs ?? []).reduce((acc, doc) => {
    const plates = doc.bus_plates;
    if (!acc[plates]) {
      acc[plates] = { plates, bus_serial: doc.bus_serial, docs: [] };
    }
    acc[plates].docs.push(doc);
    return acc;
  }, {} as Record<string, { plates: string; bus_serial?: string; docs: typeof docs }>);

  const busList = Object.values(grouped).filter((b) =>
    b.plates.toLowerCase().includes(search.toLowerCase()) ||
    (b.bus_serial ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const busDocs = selectedBus ? grouped[selectedBus]?.docs ?? [] : [];
  const filteredDocs = busDocs.filter((d) =>
    d.document_type.toLowerCase().includes(search.toLowerCase())
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
    const finalDocType = form.document_type === "Tjetër" ? customType : form.document_type;
    if (!finalDocType) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso emrin e dokumentit të personalizuar.",
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
      await createDoc({
        operator_id: operatorId,
        bus_plates: form.bus_plates,
        bus_serial: form.bus_serial || undefined,
        document_type: finalDocType,
        valid_until: form.valid_until,
        alarm_days: form.alarm_days,
        notes: form.notes,
        file_storage_id,
      });
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
      setCustomType("");
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

  const handleEditSubmit = async () => {
    if (!editForm.bus_plates || !editForm.document_type || !editForm.valid_until) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso fushat e detyrueshme.",
      });
      return;
    }
    const finalDocType = editForm.document_type === "Tjetër" ? customType : editForm.document_type;
    if (!finalDocType) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso emrin e dokumentit të personalizuar.",
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
      await updateDoc({
        id: editTarget._id,
        bus_plates: editForm.bus_plates,
        bus_serial: editForm.bus_serial || undefined,
        document_type: finalDocType,
        valid_until: editForm.valid_until,
        alarm_days: editForm.alarm_days,
        notes: editForm.notes,
        file_storage_id,
      });
      toast({ title: "Sukses", description: "Dokumenti u përditësua." });
      setEditSheetOpen(false);
      setEditTarget(null);
      setCustomType("");
      setSelectedFile(null);
      if (selectedBus && selectedBus !== editForm.bus_plates) {
        setSelectedBus(editForm.bus_plates);
      }
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

  const handleOpenEdit = (doc: any) => {
    const isCustom = !BUS_DOC_TYPES.includes(doc.document_type);
    setEditTarget(doc);
    setEditForm({
      bus_plates: doc.bus_plates,
      bus_serial: doc.bus_serial || "",
      document_type: isCustom ? "Tjetër" : doc.document_type,
      valid_until: doc.valid_until,
      alarm_days: doc.alarm_days,
      notes: doc.notes || "",
    });
    setCustomType(isCustom ? doc.document_type : "");
    setSelectedFile(null);
    setEditSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <ExpirySummary docs={docs ?? []} />
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={selectedBus ? "Kërko dokument..." : "Kërko autobus..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-gray-300 text-sm"
            />
          </div>
          <Button
            onClick={() => {
              setForm({
                bus_plates: selectedBus || "",
                bus_serial: selectedBus ? grouped[selectedBus]?.bus_serial || "" : "",
                document_type: "",
                valid_until: "",
                alarm_days: 30,
                notes: "",
              });
              setCustomType("");
              setSelectedFile(null);
              setSheetOpen(true);
            }}
            className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> Regjistro
          </Button>
        </div>
      </div>

      {docs === undefined ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      ) : !selectedBus ? (
        busList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white rounded-xl border border-gray-200">
            <Bus className="h-10 w-10 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              {search ? "Nuk u gjet asnjë autobus." : "Nuk ka autobusë të regjistruar."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {busList.map((bus) => {
              const busExpired = bus.docs.filter(
                (d) => differenceInDays(parseISO(d.valid_until), new Date()) < 0
              ).length;
              const busWarning = bus.docs.filter((d) => {
                const days = differenceInDays(parseISO(d.valid_until), new Date());
                return days >= 0 && days <= d.alarm_days;
              }).length;

              return (
                <Card
                  key={bus.plates}
                  className="border-gray-200 shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedBus(bus.plates);
                    setSearch("");
                  }}
                >
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-semibold text-sm">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-mono font-bold text-gray-900 truncate">{bus.plates}</h3>
                        <p className="text-xs text-gray-500 truncate">
                          {bus.bus_serial ? `Seria: ${bus.bus_serial}` : "Nuk ka seri"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{bus.docs.length} dokumente</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {busExpired > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> {busExpired} skaduar
                        </span>
                      ) : null}
                      {busWarning > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <Clock className="h-3 w-3" /> {busWarning} paralajmërim
                        </span>
                      ) : null}
                      {busExpired === 0 && busWarning === 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Në rregull
                        </span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedBus(null);
                  setSearch("");
                }}
                className="h-8 w-8 text-gray-500 hover:text-gray-950"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="font-bold text-gray-900 text-lg font-mono">{selectedBus}</h2>
                <p className="text-xs text-gray-500">
                  {grouped[selectedBus]?.bus_serial ? `Seria: ${grouped[selectedBus].bus_serial}` : "Dokumentet e autobusit"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setForm({
                  bus_plates: selectedBus,
                  bus_serial: grouped[selectedBus]?.bus_serial || "",
                  document_type: "",
                  valid_until: "",
                  alarm_days: 30,
                  notes: "",
                });
                setCustomType("");
                setSelectedFile(null);
                setSheetOpen(true);
              }}
              size="sm"
              className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Shto Dokument
            </Button>
          </div>

          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white">
                  <FileText className="h-10 w-10 text-gray-200" />
                  <p className="text-sm font-medium text-gray-500">
                    {search ? "Nuk u gjet asnjë dokument." : "Nuk ka dokumente për këtë autobus."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <DocTableHead cols={["Tipi", "Shënime"]} />
                    <TableBody>
                      {filteredDocs.map((doc) => (
                        <TableRow
                          key={doc._id}
                          className="border-gray-100 hover:bg-gray-50/50"
                        >
                          <TableCell className="text-sm font-semibold text-gray-900 py-3">
                            <Badge
                              variant="outline"
                              className="border-gray-200 bg-gray-50 text-gray-750 text-xs"
                            >
                              {doc.document_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                            {doc.notes || "—"}
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
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-gray-900"
                                onClick={() => handleOpenEdit(doc)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-red-600"
                                onClick={() => setDelTarget(doc._id)}
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
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-bold text-gray-900">
              Regjistro Dokument Autobusi
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
                onValueChange={(v) => {
                  setForm((p) => ({ ...p, document_type: v }));
                  if (v !== "Tjetër") setCustomType("");
                }}
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {[...BUS_DOC_TYPES, "Tjetër"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            {form.document_type === "Tjetër" && (
              <DocFormField label="Emri i Dokumentit të ri *" id="custom-type">
                <Input
                  placeholder="p.sh. Libreza e gjelbër..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="border-gray-300 h-9 text-sm"
                />
              </DocFormField>
            )}
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

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-bold text-gray-900">
              Ndrysho Dokument Autobusi
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Përditëso detajet e dokumentit të autobusit.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-2">
            <DocFormField label="Bus Tabllat *" id="edit-bp">
              <Input
                placeholder="MK-AB-123"
                value={editForm.bus_plates}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, bus_plates: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm font-mono"
              />
            </DocFormField>
            <DocFormField label="Bus Seria" id="edit-bs">
              <Input
                placeholder="WDB9066351R....."
                value={editForm.bus_serial}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, bus_serial: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm font-mono"
              />
            </DocFormField>
            <DocFormField label="Tipi i Dokumentit *" id="edit-dt">
              <Select
                value={editForm.document_type}
                onValueChange={(v) => {
                  setEditForm((p) => ({ ...p, document_type: v }));
                  if (v !== "Tjetër") setCustomType("");
                }}
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {[...BUS_DOC_TYPES, "Tjetër"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            {editForm.document_type === "Tjetër" && (
              <DocFormField label="Emri i Dokumentit të ri *" id="edit-custom-type">
                <Input
                  placeholder="p.sh. Libreza e gjelbër..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="border-gray-300 h-9 text-sm"
                />
              </DocFormField>
            )}
            <DocFormField label="Valid Deri Me *" id="edit-vu">
              <Input
                type="date"
                value={editForm.valid_until}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, valid_until: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Alarmi (ditë para skadimit)" id="edit-ad">
              <Select
                value={String(editForm.alarm_days)}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, alarm_days: Number(v) }))
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
            <DocFormField label="Skedar (foto/PDF)" id="edit-file">
              <div className="flex flex-col gap-2">
                {editTarget?.file_url && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs">
                    <span className="text-blue-700 font-medium truncate max-w-[200px]">
                      Skedari ekzistues
                    </span>
                    <a
                      href={editTarget.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Shiko
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 gap-1.5 h-9"
                    onClick={() => editFileRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Ngarko të ri
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                      {selectedFile.name}
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (editFileRef.current) editFileRef.current.value = "";
                        }}
                      >
                        <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 ml-1" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            </DocFormField>
            <DocFormField label="Shënime" id="edit-notes">
              <Input
                placeholder="Shënime opsionale..."
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
          </div>
          <SheetFooter className="pt-4 border-t border-gray-100 flex flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              onClick={() => {
                setEditSheetOpen(false);
                setEditTarget(null);
                setSelectedFile(null);
              }}
              disabled={isSubmitting || uploading}
            >
              Anulo
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleEditSubmit}
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Duke përditësuar...
                </span>
              ) : (
                "Ruaj Ndryshimet"
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

function DozvollatTab({ operatorId }: { operatorId: string }) {
  const { toast } = useToast();
  const docs = useQuery(api.documents.getDozvollat, {
    operator_id: operatorId,
  });
  const createDoc = useMutation(api.documents.createDozvoll);
  const updateDoc = useMutation(api.documents.updateDozvoll);
  const deleteDoc = useMutation(api.documents.deleteDozvoll);
  const { uploadFile, uploading } = useFileUpload();

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Id<"dozvollat"> | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    document_type: "",
    label: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    document_type: "",
    label: "",
    valid_until: "",
    alarm_days: 30,
    notes: "",
  });
  const [customType, setCustomType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const grouped = (docs ?? []).reduce((acc, doc) => {
    const type = doc.document_type;
    if (!acc[type]) {
      acc[type] = { type, docs: [] };
    }
    acc[type].docs.push(doc);
    return acc;
  }, {} as Record<string, { type: string; docs: typeof docs }>);

  const dozvollTypeList = Object.values(grouped).filter((d) =>
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  const dozvollDocs = selectedType ? grouped[selectedType]?.docs ?? [] : [];
  const filteredDocs = dozvollDocs.filter((d) =>
    d.label.toLowerCase().includes(search.toLowerCase())
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
    const finalDocType = form.document_type === "Tjetër" ? customType : form.document_type;
    if (!finalDocType) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso emrin e dokumentit të personalizuar.",
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
      await createDoc({
        operator_id: operatorId,
        document_type: finalDocType,
        label: form.label,
        valid_until: form.valid_until,
        alarm_days: form.alarm_days,
        notes: form.notes,
        file_storage_id,
      });
      toast({ title: "Sukses", description: "Dozvolla u regjistrua." });
      setSheetOpen(false);
      setForm({
        document_type: "",
        label: "",
        valid_until: "",
        alarm_days: 30,
        notes: "",
      });
      setCustomType("");
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

  const handleEditSubmit = async () => {
    if (!editForm.document_type || !editForm.label || !editForm.valid_until) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso fushat e detyrueshme.",
      });
      return;
    }
    const finalDocType = editForm.document_type === "Tjetër" ? customType : editForm.document_type;
    if (!finalDocType) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Plotëso emrin e dokumentit të personalizuar.",
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
      await updateDoc({
        id: editTarget._id,
        document_type: finalDocType,
        label: editForm.label,
        valid_until: editForm.valid_until,
        alarm_days: editForm.alarm_days,
        notes: editForm.notes,
        file_storage_id,
      });
      toast({ title: "Sukses", description: "Dozvolla u përditësua." });
      setEditSheetOpen(false);
      setEditTarget(null);
      setCustomType("");
      setSelectedFile(null);
      if (selectedType && selectedType !== finalDocType) {
        setSelectedType(finalDocType);
      }
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

  const handleOpenEdit = (doc: any) => {
    const isCustom = !DOZVOLL_DOC_TYPES.includes(doc.document_type);
    setEditTarget(doc);
    setEditForm({
      document_type: isCustom ? "Tjetër" : doc.document_type,
      label: doc.label,
      valid_until: doc.valid_until,
      alarm_days: doc.alarm_days,
      notes: doc.notes || "",
    });
    setCustomType(isCustom ? doc.document_type : "");
    setSelectedFile(null);
    setEditSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <ExpirySummary docs={docs ?? []} />
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={selectedType ? "Kërko dozvoll..." : "Kërko tipin e dozvollës..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-gray-300 text-sm"
            />
          </div>
          <Button
            onClick={() => {
              setForm({
                document_type: selectedType || "",
                label: "",
                valid_until: "",
                alarm_days: 30,
                notes: "",
              });
              setCustomType("");
              setSelectedFile(null);
              setSheetOpen(true);
            }}
            className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> Regjistro
          </Button>
        </div>
      </div>

      {docs === undefined ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      ) : !selectedType ? (
        dozvollTypeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white rounded-xl border border-gray-200">
            <ShieldCheck className="h-10 w-10 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              {search ? "Nuk u gjet asnjë dozvoll." : "Nuk ka dozvolla të regjistruara."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dozvollTypeList.map((item) => {
              const itemExpired = item.docs.filter(
                (d) => differenceInDays(parseISO(d.valid_until), new Date()) < 0
              ).length;
              const itemWarning = item.docs.filter((d) => {
                const days = differenceInDays(parseISO(d.valid_until), new Date());
                return days >= 0 && days <= d.alarm_days;
              }).length;

              return (
                <Card
                  key={item.type}
                  className="border-gray-200 shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedType(item.type);
                    setSearch("");
                  }}
                >
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-semibold text-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.type}</h3>
                        <p className="text-xs text-gray-500">{item.docs.length} leje / dozvolla</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {itemExpired > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> {itemExpired} skaduar
                        </span>
                      ) : null}
                      {itemWarning > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <Clock className="h-3 w-3" /> {itemWarning} paralajmërim
                        </span>
                      ) : null}
                      {itemExpired === 0 && itemWarning === 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Në rregull
                        </span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedType(null);
                  setSearch("");
                }}
                className="h-8 w-8 text-gray-500 hover:text-gray-950"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{selectedType}</h2>
                <p className="text-xs text-gray-500">Lejet e këtij tipi</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setForm({
                  document_type: selectedType,
                  label: "",
                  valid_until: "",
                  alarm_days: 30,
                  notes: "",
                });
                setCustomType("");
                setSelectedFile(null);
                setSheetOpen(true);
              }}
              size="sm"
              className="bg-gray-900 text-white hover:bg-gray-800 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Shto Dokument
            </Button>
          </div>

          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white">
                  <FileText className="h-10 w-10 text-gray-200" />
                  <p className="text-sm font-medium text-gray-500">
                    {search ? "Nuk u gjet asnjë dozvoll." : "Nuk ka leje të këtij tipi."}
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
                          Shënime
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
                      {filteredDocs.map((doc) => (
                        <TableRow
                          key={doc._id}
                          className="border-gray-100 hover:bg-gray-50/50"
                        >
                          <TableCell className="text-sm font-semibold text-gray-900 py-3">
                            {doc.label}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                            {doc.notes || "—"}
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
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-gray-900"
                                onClick={() => handleOpenEdit(doc)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-red-600"
                                onClick={() => setDelTarget(doc._id)}
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
        </div>
      )}

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
                onValueChange={(v) => {
                  setForm((p) => ({ ...p, document_type: v }));
                  if (v !== "Tjetër") setCustomType("");
                }}
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {[...DOZVOLL_DOC_TYPES, "Tjetër"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            {form.document_type === "Tjetër" && (
              <DocFormField label="Emri i Dokumentit të ri *" id="custom-type">
                <Input
                  placeholder="p.sh. CEMT..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="border-gray-300 h-9 text-sm"
                />
              </DocFormField>
            )}
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

      <Sheet open={editSheetOpen} onOpenChange={(o) => {
        if (!o) {
          setEditSheetOpen(false);
          setEditTarget(null);
          setCustomType("");
          setSelectedFile(null);
        }
      }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-bold text-gray-900">
              Modifiko Dozvoll
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Përditëso të dhënat e dozvollës.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-2">
            <DocFormField label="Tipi i Dokumentit *" id="edit-dt">
              <Select
                value={editForm.document_type}
                onValueChange={(v) => {
                  setEditForm((p) => ({ ...p, document_type: v }));
                  if (v !== "Tjetër") setCustomType("");
                }}
              >
                <SelectTrigger className="border-gray-300 h-9 text-sm">
                  <SelectValue placeholder="Zgjidhni dokumentin" />
                </SelectTrigger>
                <SelectContent>
                  {[...DOZVOLL_DOC_TYPES, "Tjetër"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DocFormField>
            {editForm.document_type === "Tjetër" && (
              <DocFormField label="Emri i Dokumentit të ri *" id="edit-custom-type">
                <Input
                  placeholder="p.sh. CEMT..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="border-gray-300 h-9 text-sm"
                />
              </DocFormField>
            )}
            <DocFormField label="Emërtimi (Etiketa) *" id="edit-lbl">
              <Input
                placeholder="p.sh. Dozvoll Gjermani 2026"
                value={editForm.label}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, label: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Valid Deri Me *" id="edit-vu">
              <Input
                type="date"
                value={editForm.valid_until}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, valid_until: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
            <DocFormField label="Alarmi (ditë para skadimit)" id="edit-ad">
              <Select
                value={String(editForm.alarm_days)}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, alarm_days: Number(v) }))
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
            <DocFormField label="Skedar i ri (opsional)" id="edit-file">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 gap-1.5 h-9"
                  onClick={() => editFileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> Ngarko
                </Button>
                {selectedFile && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                    {selectedFile.name}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (editFileRef.current) editFileRef.current.value = "";
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 ml-1" />
                    </button>
                  </div>
                )}
                <input
                  ref={editFileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </DocFormField>
            <DocFormField label="Shënime" id="edit-notes">
              <Input
                placeholder="Shënime opsionale..."
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="border-gray-300 h-9 text-sm"
              />
            </DocFormField>
          </div>
          <SheetFooter className="pt-4 border-t border-gray-100 flex flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              onClick={() => {
                setEditSheetOpen(false);
                setEditTarget(null);
                setCustomType("");
                setSelectedFile(null);
              }}
              disabled={isSubmitting || uploading}
            >
              Anulo
            </Button>
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleEditSubmit}
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Duke përditësuar...
                </span>
              ) : (
                "Ruaj Ndryshimet"
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
