"use client";

import { useEffect, useState, useMemo } from "react";
import { Station } from "@/models/station";
import { Route } from "@/models/route";
import { useUser } from "@/context/user";
import { useToast } from "@/components/ui/use-toast";
import { getAllStations } from "@/actions/stations";
import { createRoute, deleteRoute, getOperatorRoutes } from "@/actions/route";
import apiClient from "@/lib/axios";
import {
  Plus,
  MapPin,
  Briefcase,
  Info,
  Route as RouteIcon,
  Trash2,
  Power,
  ChevronRight,
  Globe,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Luggage
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateRoutesPage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [allStations, setAllStations] = useState<Station[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  const [selectedFromStation, setSelectedFromStation] = useState<Station | null>(null);
  const [selectedToStation, setSelectedToStation] = useState<Station | null>(null);
  const [selectedRouteNumber, setSelectedRouteNumber] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [freeLuggages, setFreeLuggages] = useState(0);
  const [extraLuggagePrice, setExtraLuggagePrice] = useState(0);
  const [luggageSize, setLuggageSize] = useState("50x50x50");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInitialData = async () => {
    if (!user?._id) return;
    setIsFetching(true);
    try {
      const stationsData = await getAllStations();
      setAllStations(stationsData || []);
      const routesData = await getOperatorRoutes(user._id);
      setRoutes(routesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchInitialData();
    }
  }, [user]);

  const handleCreateRoute = async () => {
    if (!user?._id) {
      toast({
        variant: "destructive",
        description: "Autentikimi dështoi.",
      });
      return;
    }
    if (!selectedFromStation || !selectedToStation || !selectedRouteNumber || !departureCity || !arrivalCity) {
      toast({
        variant: "destructive",
        title: "Kërkohet Veprim",
        description: "Ju lutem plotësoni të gjitha fushat kryesore gjeografike.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newRoute: Route = {
        code: selectedRouteNumber,
        contact: {
          phone: contactPhone || "/",
          email: contactEmail || "/",
        },
        stations: {
          from: selectedFromStation,
          to: selectedToStation,
        },
        destination: {
          from: departureCity,
          to: arrivalCity,
        },
        luggages: {
          free: freeLuggages,
          price_for_extra: extraLuggagePrice,
          size: luggageSize,
        },
        is_active: true,
        operator: user._id,
        generate_tickets_automatically: true,
        metadata: {
          sold: 0,
        },
      };

      await createRoute(newRoute, user._id);
      toast({
        title: "Sukses",
        description: "Linja u krijua dhe u sinkronizua me sukses!",
      });

      setSelectedRouteNumber("");
      setSelectedFromStation(null);
      setSelectedToStation(null);
      setDepartureCity("");
      setArrivalCity("");
      setContactPhone("");
      setContactEmail("");
      setFreeLuggages(0);
      setExtraLuggagePrice(0);
      setLuggageSize("50x50x50");
      setShowAdvanced(false);

      const routesData = await getOperatorRoutes(user._id);
      setRoutes(routesData || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Dështoi krijimi i linjës së re.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("A jeni i sigurt që dëshironi të fshini këtë linjë fizike?")) return;
    try {
      await deleteRoute(id);
      toast({
        title: "Sukses",
        description: "Linja u fshi me sukses!",
      });
      if (user?._id) {
        const routesData = await getOperatorRoutes(user._id);
        setRoutes(routesData || []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim gjatë fshirjes së linjës.",
      });
    }
  };

  const handleToggleStatus = async (route: Route) => {
    try {
      const isBookable = route?.metadata?.bookable !== false;
      const endpoint = isBookable
        ? `/route/disable/${route._id}`
        : `/route/enable/${route._id}`;
      const response = await apiClient.post(endpoint);
      toast({
        title: "Sinkronizimi",
        description: response.data.message || "Statusi u ndryshua me sukses!",
      });
      if (user?._id) {
        const routesData = await getOperatorRoutes(user._id);
        setRoutes(routesData || []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Dështoi ndryshimi i statusit të sinkronizimit.",
      });
    }
  };

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.destination?.from.toLowerCase().includes(q) ||
        r.destination?.to.toLowerCase().includes(q)
    );
  }, [routes, searchQuery]);

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Menaxhimi i Linjave</h1>
        <p className="text-sm text-gray-500">Konfiguroni, sinkronizoni dhe monitoroni rrjetin tuaj të udhëtimit.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-5 space-y-6">
          <Card className="shadow-md border-gray-200 overflow-hidden bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                  <RouteIcon size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Arkitekti i Linjës</CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Definoni linjën, pikat e nisjes dhe stacionet ndërmjetme
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">Kodi i Linjës (Route Code)</Label>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="p.sh. RT-PRN-MUN-01"
                      value={selectedRouteNumber}
                      onChange={(e) => setSelectedRouteNumber(e.target.value)}
                      required
                      className="pl-9 h-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Qyteti i Nisjes</Label>
                    <Input
                      placeholder="p.sh. Prishtinë"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      required
                      className="h-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Qyteti i Mbërritjes</Label>
                    <Input
                      placeholder="p.sh. Mynih"
                      value={arrivalCity}
                      onChange={(e) => setArrivalCity(e.target.value)}
                      required
                      className="h-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-3 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <MapPin size={12} className="text-emerald-500" /> Stacioni i Nisjes (Origin Hub)
                    </Label>
                    <Select
                      onValueChange={(v) => setSelectedFromStation(JSON.parse(v))}
                      value={selectedFromStation ? JSON.stringify(selectedFromStation) : undefined}
                    >
                      <SelectTrigger className="h-10 bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Zgjidh Terminalin e Origjinës" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStations.map((s) => (
                          <SelectItem key={s._id} value={JSON.stringify(s)}>
                            {s.city} - {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <MapPin size={12} className="text-blue-500" /> Stacioni i Mbërritjes (Destination Hub)
                    </Label>
                    <Select
                      onValueChange={(v) => setSelectedToStation(JSON.parse(v))}
                      value={selectedToStation ? JSON.stringify(selectedToStation) : undefined}
                    >
                      <SelectTrigger className="h-10 bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Zgjidh Terminalin e Destinacionit" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStations.map((s) => (
                          <SelectItem key={s._id} value={JSON.stringify(s)}>
                            {s.city} - {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Luggage size={14} className="text-blue-600" /> Parametrat Opsional (Bagazhet & Kontaktet)
                  </span>
                  {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showAdvanced && (
                  <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <Phone size={11} className="text-gray-400" /> Telefon Kontakti
                        </Label>
                        <Input
                          placeholder="+383 44 111 222"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="h-10 text-xs bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <Mail size={11} className="text-gray-400" /> Email Kontakti
                        </Label>
                        <Input
                          type="email"
                          placeholder="info@kompania.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="h-10 text-xs bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold text-gray-600">Bagazh Falas</Label>
                        <Input
                          type="number"
                          min={0}
                          value={freeLuggages}
                          onChange={(e) => setFreeLuggages(parseInt(e.target.value) || 0)}
                          className="h-10 text-xs bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold text-gray-600">Çmimi shtesë €</Label>
                        <Input
                          type="number"
                          min={0}
                          value={extraLuggagePrice}
                          onChange={(e) => setExtraLuggagePrice(parseInt(e.target.value) || 0)}
                          className="h-10 text-xs bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold text-gray-600">Përmasat max</Label>
                        <Input
                          placeholder="50x50x50"
                          value={luggageSize}
                          onChange={(e) => setLuggageSize(e.target.value)}
                          className="h-10 text-xs bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleCreateRoute}
                  className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-sm rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Duke krijuar linjën...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <Plus size={16} />
                      Regjistro Linjën e Re
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-7 space-y-6">
          <Card className="shadow-md border-gray-200 overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Regjistri i Linjave</CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Udhëtimet aktive të konfiguruara në profilin tuaj
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kërko me kod, nisje..."
                  className="pl-9 h-9 text-xs bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3 px-6 text-left">Kodi i Linjës</th>
                    <th className="py-3 px-6 text-left">Përshkrimi i Udhëtimit</th>
                    <th className="py-3 px-6 text-center">Sinkronizimi i Shitjeve</th>
                    <th className="py-3 px-6 text-right">Menaxhimi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isFetching ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-gray-400">
                        Duke ngarkuar të dhënat...
                      </td>
                    </tr>
                  ) : filteredRoutes.length > 0 ? (
                    filteredRoutes.map((route) => {
                      const isBookable = route.metadata?.bookable !== false;
                      return (
                        <tr key={route._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-xs">{route.code}</span>
                              <span className="text-[10px] text-gray-400 font-medium italic mt-0.5">Udhëtim Ndërkombëtar</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 text-xs">
                                {route.destination?.from} → {route.destination?.to}
                              </span>
                              <div className="flex items-center text-[10px] text-gray-500 mt-1">
                                <span className="opacity-90">{route.stations?.from && typeof route.stations.from === 'object' ? (route.stations.from as Station).name : ""}</span>
                                <ChevronRight size={10} className="mx-1 opacity-55 text-blue-600" />
                                <span className="opacity-90">{route.stations?.to && typeof route.stations.to === 'object' ? (route.stations.to as Station).name : ""}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Badge
                              variant="outline"
                              className={`italic text-[10px] px-2 py-0.5 ${
                                isBookable
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {isBookable ? "Sync: Aktiv" : "Sync: Paaktivizuar"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 rounded-lg ${
                                  isBookable
                                    ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                    : "text-amber-600 hover:text-amber-700 bg-amber-50"
                                }`}
                                onClick={() => handleToggleStatus(route)}
                                title={isBookable ? "Çaktivizo Shitjet" : "Aktivizo Shitjet"}
                              >
                                <Power size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                onClick={() => handleDelete(route._id!)}
                                title="Fshi Linjën"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-gray-400 opacity-60">
                          <Globe size={40} className="text-gray-400" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-gray-700">Nuk u gjet asnjë linjë</p>
                            <p className="text-[10px] text-gray-500">Konfiguroni linjën e parë duke përdorur panelin e majtë.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
