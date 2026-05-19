"use client";

import { getAllStations } from "@/actions/stations";
import { Station } from "@/models/station";
import { Route } from "@/models/route";
import { API_URL } from "@/environment";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState, useMemo, useRef } from "react";
import { Plus, X, Search, ChevronDown, Send, Bus, Copy, ArrowLeftRight, Trash2, AlertTriangle } from "lucide-react";
import { useUser } from "@/context/user";

interface IDayOfWeek {
  key: string;
  value: number;
}

const days: IDayOfWeek[] = [
  { key: "monday", value: 2 },
  { key: "tuesday", value: 3 },
  { key: "wednesday", value: 4 },
  { key: "thursday", value: 5 },
  { key: "friday", value: 6 },
  { key: "saturday", value: 7 },
  { key: "sunday", value: 1 }
];

interface CellData {
  price: string;
  our_return_price: string;
  childrenPrice: string;
  time: string;
  duration: string;
}

type MatrixData = Record<string, Record<string, CellData>>;

const emptyCell = (): CellData => ({
  price: "",
  our_return_price: "",
  childrenPrice: "",
  time: "",
  duration: "",
});

const groupByCountry = (stations: Station[]): Record<string, Station[]> => {
  const map: Record<string, Station[]> = {};
  stations.forEach((s) => {
    const c = s.country || "Unknown";
    if (!map[c]) map[c] = [];
    map[c].push(s);
  });
  return map;
};

type ModalMode = "flip" | "clear" | null;

function ConfirmModal({
  mode,
  onConfirm,
  onCancel,
}: {
  mode: ModalMode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!mode) return null;

  const isFlip = mode === "flip";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`h-1 w-full ${isFlip ? "bg-blue-600" : "bg-red-600"}`} />

        <div className="p-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isFlip ? "bg-blue-50 border border-blue-100" : "bg-red-50 border border-red-100"}`}>
            {isFlip ? (
              <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            ) : (
              <Trash2 className="w-6 h-6 text-red-600" />
            )}
          </div>

          <h2 className="text-base font-bold text-gray-900 mb-1">
            {isFlip ? "Flip the table?" : "Clear the table?"}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {isFlip ? (
              "Departure stations will become arrivals and arrivals will become departures."
            ) : (
              "All stations and filled data will be permanently removed."
            )}
          </p>
          {isFlip && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Prices, return prices, child prices and durations will be carried over from the original table. Only the start times will be cleared — you'll need to fill those in for the return journey.
              </p>
            </div>
          )}
          {!isFlip && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-800 leading-relaxed">
                This action cannot be undone. All data will be lost.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${isFlip ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {isFlip ? (
                <>
                  <ArrowLeftRight className="w-4 h-4" /> Flip
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Clear
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StationPicker({
  all,
  exclude,
  onSelect,
  label,
}: {
  all: Station[];
  exclude: string[];
  onSelect: (s: Station) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const ref = useRef<HTMLDivElement>(null);
  
  const grouped = useMemo(() => groupByCountry(all), [all]);
  const countries = useMemo(() => Object.keys(grouped).sort(), [grouped]);
  
  const filtered = useMemo(() => {
    const pool = country === "all" ? all : grouped[country] || [];
    const q = query.toLowerCase();
    return pool.filter(
      (s) =>
        !exclude.includes(s._id!) &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q))
    );
  }, [all, country, query, exclude, grouped]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap"
      >
        <Plus className="w-3.5 h-3.5 text-blue-600" />
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="flex gap-1 p-2 flex-wrap border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setCountry("all")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${country === "all" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"}`}
            >
              All
            </button>
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${country === c ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative p-2 border-b border-gray-100">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search station…"
              className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-6">No results</p>
            )}
            {filtered.map((s) => (
              <button
                key={s._id}
                onClick={() => {
                  onSelect(s);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {s.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {s.city} · {s.country || ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixCell({
  data,
  onChange,
  isAutofilled,
  isSource,
}: {
  data: CellData;
  onChange: (field: keyof CellData, value: string) => void;
  isAutofilled?: boolean;
  isSource?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasData = !!(data.price || data.time);
  
  const bgClass = focused
    ? "bg-blue-50/70 z-10"
    : isSource
    ? "bg-purple-50"
    : isAutofilled
    ? "bg-amber-50/40"
    : hasData
    ? "bg-emerald-50/50"
    : "bg-white hover:bg-gray-50/50";
    
  const borderClass = isSource
    ? "border-purple-200"
    : isAutofilled
    ? "border-amber-200"
    : hasData
    ? "border-emerald-200"
    : "border-gray-200";
    
  const dotColor = isSource
    ? "bg-purple-500"
    : isAutofilled
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <td
      className={`relative border transition-all align-top ${bgClass} ${borderClass}`}
      style={{ minWidth: 190 }}
    >
      {isAutofilled && !isSource && (
        <div className="absolute top-1.5 left-1.5">
          <Copy className="w-2.5 h-2.5 text-amber-500/50" />
        </div>
      )}
      <div
        className="p-2 space-y-1.5"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocused(false);
          }
        }}
      >
        <div className="grid grid-cols-2 gap-1.5">
          <input
            type="number"
            value={data.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="Price €"
            className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            value={data.our_return_price}
            onChange={(e) => onChange("our_return_price", e.target.value)}
            placeholder="Return €"
            className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            value={data.childrenPrice}
            onChange={(e) => onChange("childrenPrice", e.target.value)}
            placeholder="Child €"
            className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={data.time}
            onChange={(e) => onChange("time", e.target.value)}
            placeholder="HH:mm"
            className={`w-full bg-white border rounded px-1.5 py-1 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 ${!data.time && hasData ? "border-amber-400 placeholder-amber-600 bg-amber-50/20" : "border-gray-300"}`}
          />
        </div>
        <input
          type="text"
          value={data.duration}
          onChange={(e) => onChange("duration", e.target.value)}
          placeholder="Duration HH:mm"
          className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
        />
        {hasData && (
          <div className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
        )}
      </div>
    </td>
  );
}

export default function CreateTickets() {
  const { toast } = useToast();
  const { user } = useUser();
  
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeNumber, setRouteNumber] = useState("");
  const [departureTime, setDepartureTime] = useState("09:00");
  const [numberOfTickets, setNumberOfTickets] = useState(6);
  const [weeksToGenerate, setWeeksToGenerate] = useState("1");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [fromStations, setFromStations] = useState<Station[]>([]);
  const [toStations, setToStations] = useState<Station[]>([]);
  const [matrix, setMatrix] = useState<MatrixData>({});
  const [submitting, setSubmitting] = useState(false);
  const [autofillRows, setAutofillRows] = useState<Set<string>>(new Set());
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  useEffect(() => {
    if (user) {
      getAllStations().then(setAllStations);
      axios
        .get(`${API_URL}/route`)
        .then((r: AxiosResponse) => setRoutes(r.data.data))
        .catch(console.error);
    }
  }, [user]);

  const addFrom = (s: Station) => {
    if (fromStations.find((x) => x._id === s._id)) return;
    setFromStations((p) => [...p, s]);
    setMatrix((prev) => {
      const next: MatrixData = { ...prev, [s._id!]: {} };
      toStations.forEach((t) => {
        next[s._id!][t._id!] = emptyCell();
      });
      return next;
    });
  };

  const addTo = (s: Station) => {
    if (toStations.find((x) => x._id === s._id)) return;
    setToStations((p) => [...p, s]);
    setMatrix((prev) => {
      const next = { ...prev };
      fromStations.forEach((f) => {
        if (!next[f._id!]) next[f._id!] = {};
        if (autofillRows.has(f._id!)) {
          const firstToId = toStations[0]?._id;
          const source = firstToId ? next[f._id!][firstToId] : null;
          next[f._id!][s._id!] = source ? { ...source } : emptyCell();
        } else {
          next[f._id!][s._id!] = emptyCell();
        }
      });
      return next;
    });
  };

  const removeFrom = (id: string) => {
    setFromStations((p) => p.filter((s) => s._id !== id));
    setMatrix((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setAutofillRows((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const removeTo = (id: string) => {
    setToStations((p) => p.filter((s) => s._id !== id));
    setMatrix((prev) => {
      const n = { ...prev };
      Object.keys(n).forEach((fid) => {
        delete n[fid][id];
      });
      return n;
    });
  };

  const updateCell = (
    fromId: string,
    toId: string,
    field: keyof CellData,
    value: string
  ) => {
    setMatrix((prev) => {
      const updatedRow = {
        ...prev[fromId],
        [toId]: { ...prev[fromId]?.[toId], [field]: value },
      };
      const isFirstCol = toStations[0]?._id === toId;
      if (autofillRows.has(fromId) && isFirstCol) {
        const sourceCell = updatedRow[toId];
        toStations.slice(1).forEach((t) => {
          updatedRow[t._id!] = { ...sourceCell };
        });
      }
      return { ...prev, [fromId]: updatedRow };
    });
  };

  const toggleAutofill = (fromId: string) => {
    setAutofillRows((prev) => {
      const next = new Set(prev);
      if (next.has(fromId)) {
        next.delete(fromId);
      } else {
        next.add(fromId);
        const firstToId = toStations[0]?._id;
        if (firstToId) {
          setMatrix((m) => {
            const source = m[fromId]?.[firstToId];
            if (!source) return m;
            const updatedRow = { ...m[fromId] };
            toStations.slice(1).forEach((t) => {
              updatedRow[t._id!] = { ...source };
            });
            return { ...m, [fromId]: updatedRow };
          });
        }
      }
      return next;
    });
  };

  const doFlip = () => {
    const newMatrix: MatrixData = {};
    toStations.forEach((newFrom) => {
      newMatrix[newFrom._id!] = {};
      fromStations.forEach((newTo) => {
        const original = matrix[newTo._id!]?.[newFrom._id!];
        newMatrix[newFrom._id!][newTo._id!] = {
          price: original?.price ?? "",
          our_return_price: original?.our_return_price ?? "",
          childrenPrice: original?.childrenPrice ?? "",
          duration: original?.duration ?? "",
          time: "",
        };
      });
    });
    setFromStations(toStations);
    setToStations(fromStations);
    setMatrix(newMatrix);
    setAutofillRows(new Set());
    setModalMode(null);
  };

  const doClear = () => {
    setFromStations([]);
    setToStations([]);
    setMatrix({});
    setAutofillRows(new Set());
    setModalMode(null);
  };

  const filledCells = useMemo(() => {
    let count = 0;
    fromStations.forEach((f) => {
      toStations.forEach((t) => {
        const c = matrix[f._id!]?.[t._id!];
        if (c?.price && c?.time) count++;
      });
    });
    return count;
  }, [matrix, fromStations, toStations]);

  const handleSubmit = async () => {
    if (!user?._id) {
      return toast({
        variant: "destructive",
        description: "Autentikimi dështoi.",
      });
    }
    if (!routeNumber) {
      return toast({
        variant: "destructive",
        description: "Ju lutem zgjidhni linjën.",
      });
    }
    if (!fromStations.length || !toStations.length) {
      return toast({
        variant: "destructive",
        description: "Shtoni stacionet e nisjes dhe mbërritjes.",
      });
    }
    if (!selectedDays.length) {
      return toast({
        variant: "destructive",
        description: "Zgjidhni të paktën një ditë.",
      });
    }

    const stops: any[] = [];
    fromStations.forEach((f) => {
      toStations.forEach((t) => {
        const c = matrix[f._id!]?.[t._id!];
        if (c?.price && c?.childrenPrice && c?.time && c?.duration) {
          stops.push({
            from: f._id,
            to: t._id,
            time: c.time,
            price: parseFloat(c.price),
            return_price: parseFloat(c.our_return_price) || 0,
            children_price: parseFloat(c.childrenPrice),
            max_buying_time: c.duration,
          });
        }
      });
    });

    const payload = {
      route_number: routeNumber,
      destination: {
        from: fromStations[0].name,
        to: toStations[toStations.length - 1].name,
      },
      time: departureTime,
      stops,
      number_of_tickets: numberOfTickets || 6,
      metadata: {
        operator_name: user.name || "Operator",
        operator_company_name: user.company_name || "Operator Company",
      },
      days_of_week: selectedDays.map(Number),
      weeks_to_generate: parseInt(weeksToGenerate),
    };

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/ticket/create/${user._id}`, payload);
      toast({
        title: "Sukses",
        description: "Biletat u krijuan me sukses!",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim gjatë krijimit të biletave.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allExclude = [
    ...fromStations.map((s) => s._id!),
    ...toStations.map((s) => s._id!),
  ];
  const hasData = fromStations.length > 0 || toStations.length > 0;

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900 flex flex-col"
      style={{
        fontFamily:
          "'DM Mono', 'Fira Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <ConfirmModal
        mode={modalMode}
        onConfirm={modalMode === "flip" ? doFlip : doClear}
        onCancel={() => setModalMode(null)}
      />

      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-3">
            <Bus className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs tracking-widest text-gray-900 uppercase">
              Matrica e Biletave
            </span>
          </div>

          <select
            value={routeNumber}
            onChange={(e) => setRouteNumber(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Zgjidh Linjën…</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.code}
              </option>
            ))}
          </select>

          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-28"
          />

          <input
            type="number"
            value={numberOfTickets}
            min={1}
            onChange={(e) => setNumberOfTickets(parseInt(e.target.value) || 1)}
            placeholder="Tickets"
            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-20"
          />

          <select
            value={weeksToGenerate}
            onChange={(e) => setWeeksToGenerate(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="1">1 javë</option>
            <option value="2">2 javë</option>
            <option value="3">3 javë</option>
            <option value="4">1 muaj</option>
            <option value="8">2 muaj</option>
            <option value="16">4 muaj</option>
            <option value="24">6 muaj</option>
            <option value="52">1 vit</option>
            <option value="104">2 vite</option>
          </select>

          <div className="flex gap-1">
            {days.map((day: IDayOfWeek) => (
              <button
                key={day.value}
                onClick={() =>
                  setSelectedDays((p) =>
                    p.includes(day.value)
                      ? p.filter((d) => d !== day.value)
                      : [...p, day.value]
                  )
                }
                title={day.key}
                className={`w-7 h-7 rounded text-[10px] font-bold border transition-all ${selectedDays.includes(day.value) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"}`}
              >
                {day.key.slice(0, 2).toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            onClick={() => hasData && setModalMode("flip")}
            disabled={!hasData}
            title="Ndërro: nisjet ↔ mbërritjet, ruan çmimet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Ndërro
          </button>

          <button
            onClick={() => hasData && setModalMode("clear")}
            disabled={!hasData}
            title="Fshi të gjitha të dhënat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Fshi
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-[11px] text-gray-500 hidden sm:block">
              <span className="text-emerald-600 font-bold">{filledCells}</span>
              <span className="text-gray-400">/{fromStations.length * toStations.length} plotësuar</span>
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 rounded-lg text-xs font-bold text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Duke dërguar…" : "Krijo Biletat"}
            </button>
          </div>
        </div>
      </header>

      <div
        className="flex-1 overflow-auto bg-white"
      >
        <table className="border-collapse" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 top-0 z-20 bg-gray-50 border border-gray-200 p-3 align-bottom"
                style={{ minWidth: 220, width: 220 }}
              >
                <div className="text-[10px] leading-relaxed text-left">
                  <div className="text-emerald-600 font-bold tracking-widest">
                    ↓ NISJA
                  </div>
                  <div className="text-blue-600 font-bold tracking-widest">
                    → MBËRRITJA
                  </div>
                </div>
              </th>

              {toStations.map((t) => (
                <th
                  key={t._id}
                  className="sticky top-0 z-10 bg-gray-50 border border-gray-200 p-2.5 text-left align-bottom"
                  style={{ minWidth: 190 }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-blue-600 truncate">
                        {t.city}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {t.name}
                      </p>
                      {t.country && (
                        <span className="text-[9px] text-blue-500/60 uppercase tracking-wider">
                          {t.country}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeTo(t._id!)}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}

              <th
                className="sticky top-0 z-10 bg-gray-50 border border-gray-200 p-2.5 align-middle"
                style={{ minWidth: 160 }}
              >
                <StationPicker
                  all={allStations}
                  exclude={allExclude}
                  onSelect={addTo}
                  label="Shto mbërritje"
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {fromStations.map((f) => {
              const isAutofillOn = autofillRows.has(f._id!);
              return (
                <tr key={f._id}>
                  <td
                    className="sticky left-0 z-10 bg-gray-50 border border-gray-200 p-2.5 align-top"
                    style={{ minWidth: 220 }}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-emerald-600 truncate">
                          {f.city}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {f.name}
                        </p>
                        {f.country && (
                          <span className="text-[9px] text-emerald-500/60 uppercase tracking-wider">
                            {f.country}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFrom(f._id!)}
                        className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <label
                      className={`flex items-center gap-2 cursor-pointer select-none px-2 py-1.5 rounded-md border transition-all w-full ${isAutofillOn ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200 hover:border-gray-300"}`}
                      title="Plotëso të gjitha kolonat në këtë rresht me të njëjtat të dhëna si kolona e parë"
                    >
                      <input
                        type="checkbox"
                        checked={isAutofillOn}
                        onChange={() => toggleAutofill(f._id!)}
                        className="sr-only"
                      />
                      <div
                        className={`relative flex-shrink-0 w-8 h-4 rounded-full border transition-all ${isAutofillOn ? "bg-amber-500 border-amber-400" : "bg-gray-100 border-gray-300"}`}
                      >
                        <div
                          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${isAutofillOn ? "left-4 bg-white" : "left-0.5 bg-gray-400"}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-[10px] font-bold leading-none ${isAutofillOn ? "text-amber-700" : "text-gray-500"}`}
                        >
                          {isAutofillOn ? "Auto-fill PO" : "Auto-fill"}
                        </p>
                        {isAutofillOn && (
                          <p className="text-[9px] text-amber-600/75 leading-tight mt-0.5 flex items-center gap-0.5">
                            <Copy className="w-2 h-2" />
                            kol 1 → të gjitha
                          </p>
                        )}
                      </div>
                    </label>
                  </td>

                  {toStations.map((t, colIdx) => (
                    <MatrixCell
                      key={t._id}
                      data={matrix[f._id!]?.[t._id!] || emptyCell()}
                      onChange={(field, value) =>
                        updateCell(f._id!, t._id!, field, value)
                      }
                      isSource={isAutofillOn && colIdx === 0}
                      isAutofilled={isAutofillOn && colIdx > 0}
                    />
                  ))}

                  <td className="border border-gray-200 bg-transparent" />
                </tr>
              );
            })}

            <tr>
              <td
                className="sticky left-0 z-10 bg-gray-50 border border-gray-200 p-2.5"
                style={{ minWidth: 220 }}
              >
                <StationPicker
                  all={allStations}
                  exclude={allExclude}
                  onSelect={addFrom}
                  label="Shto nisje"
                />
              </td>
              {toStations.map((t) => (
                <td
                  key={t._id}
                  className="border border-gray-200 bg-gray-50/50"
                  style={{ minWidth: 190, height: 40 }}
                />
              ))}
              <td className="border border-gray-200 bg-gray-50/50" />
            </tr>
          </tbody>
        </table>

        {fromStations.length === 0 && toStations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-3 select-none">
            <Bus className="w-14 h-14 opacity-20 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">
              Filloni duke shtuar stacionet
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-400 mt-2">
              <span className="flex items-center gap-2">
                <span className="px-2 py-0.5 border border-emerald-300 rounded text-emerald-600 text-[10px] bg-emerald-50">
                  + Shto nisje
                </span>{" "}
                shton rresht
              </span>
              <span className="flex items-center gap-2">
                <span className="px-2 py-0.5 border border-blue-300 rounded text-blue-600 text-[10px] bg-blue-50">
                  + Shto mbërritje
                </span>{" "}
                shton kolonë
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-3 left-4 flex items-center gap-4 text-[10px] text-gray-400 pointer-events-none z-10">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{" "}
          plotësuar
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />{" "}
          burimi (kol 1)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{" "}
          auto-plotësuar
        </span>
      </div>
    </div>
  );
}
