"use client";

import { useEffect, useState, useMemo } from "react";
import { getStationByOperator, createStation, deleteStation } from "@/actions/stations";
import { Station } from "@/models/station";
import { useUser } from "@/context/user";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Navigation, Building, Globe, CheckCircle2, AlertCircle, Hash, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CreateStationsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
    address: "",
    location: {
      lat: "",
      lng: "",
    },
    code: "",
  });
  
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStations = async () => {
    if (!user?._id) return;
    setIsFetching(true);
    try {
      const data = await getStationByOperator(user._id);
      setStations(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchStations();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) {
      toast({
        variant: "destructive",
        description: "Autentikimi dështoi.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const stationPayload: Station = {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        address: formData.address,
        location: {
          lat: parseFloat(formData.location.lat) || 0,
          lng: parseFloat(formData.location.lng) || 0,
        },
        code: formData.code,
      };

      await createStation(stationPayload, user._id);
      toast({
        title: "Sukses",
        description: "Stacioni u krijua me sukses!",
      });
      setFormData({
        name: "",
        city: "",
        country: "",
        address: "",
        location: { lat: "", lng: "" },
        code: "",
      });
      fetchStations();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Dështoi krijimi i stacionit.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("A jeni i sigurt që dëshironi të fshini këtë stacion?")) return;
    try {
      await deleteStation(stationId);
      toast({
        title: "Sukses",
        description: "Stacioni u fshi me sukses!",
      });
      fetchStations();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Dështoi fshirja e stacionit.",
      });
    }
  };

  const filteredStations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [stations, searchQuery]);

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Regjistri i Stacioneve</h1>
        <p className="text-sm text-gray-500">Krijoni dhe menaxhoni stacionet e linjave tuaja të udhëtimit.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-5">
          <Card className="shadow-md border-gray-200 overflow-hidden bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                  <Navigation size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Shto Stacion të Ri</CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Konfiguroni koordinatat dhe adresën e stacionit
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Emri i Stacionit</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="p.sh. Stacioni Qendror Prishtinë"
                        className="pl-9 h-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600">Kodi i Stacionit</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          required
                          placeholder="p.sh. PRN-01"
                          className="pl-9 h-10 bg-white border-gray-300 text-gray-900 font-mono text-xs focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600">Operator</Label>
                      <Input
                        value={user?.name || "Operatori Aktiv"}
                        disabled
                        className="h-10 bg-gray-50 border-gray-200 text-gray-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600">Qyteti</Label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="City"
                        className="h-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600">Shteti</Label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="Country"
                        className="h-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Adresa Fizike</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder="Rruga, Nr. i ndërtesës"
                        className="pl-9 h-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight flex items-center">
                        <Navigation size={10} className="mr-1 rotate-45 text-blue-600" /> Gjerësia (Lat)
                      </Label>
                      <Input
                        name="lat"
                        type="number"
                        step="any"
                        value={formData.location.lat}
                        onChange={handleChange}
                        required
                        placeholder="42.6629"
                        className="h-9 bg-white border-gray-300 text-gray-900 text-xs focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight flex items-center">
                        <Navigation size={10} className="mr-1 -rotate-45 text-blue-600" /> Gjatësia (Lng)
                      </Label>
                      <Input
                        name="lng"
                        type="number"
                        step="any"
                        value={formData.location.lng}
                        onChange={handleChange}
                        required
                        placeholder="21.1655"
                        className="h-9 bg-white border-gray-300 text-gray-900 text-xs focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-sm rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Duke krijuar...
                      </div>
                    ) : (
                      "Krijo Stacionin"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-7 space-y-6">
          <Card className="shadow-md border-gray-200 overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Lista e Stacioneve</CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Stacionet aktuale të regjistruara në platformë
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kërko stacionet..."
                  className="pl-9 h-9 text-xs bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3 px-6 text-left">Stacioni / Kodi</th>
                    <th className="py-3 px-6 text-left">Qyteti / Shteti</th>
                    <th className="py-3 px-6 text-left">Adresa</th>
                    <th className="py-3 px-6 text-center">Gjeo-koordinatat</th>
                    <th className="py-3 px-6 text-right">Menaxhimi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isFetching ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-400">
                        Duke ngarkuar të dhënat...
                      </td>
                    </tr>
                  ) : filteredStations.length > 0 ? (
                    filteredStations.map((station) => (
                      <tr key={station._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-xs">{station.name}</span>
                            <span className="text-[10px] text-blue-600 font-mono font-semibold mt-0.5">{station.code}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-xs">{station.city}</span>
                            <span className="text-[10px] text-gray-500">{station.country}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600 max-w-[150px] truncate" title={station.address}>
                          {station.address}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 text-gray-600 font-mono text-[9px] font-medium border border-gray-200">
                            <span>Lat: {station.location?.lat?.toFixed(4)}</span>
                            <span className="text-gray-300">|</span>
                            <span>Lng: {station.location?.lng?.toFixed(4)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteStation(station._id!)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-gray-400 opacity-60">
                          <Globe size={40} className="text-gray-400" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-gray-700">Nuk u gjet asnjë stacion</p>
                            <p className="text-[10px] text-gray-500">Krijoni stacionin e parë duke përdorur formularin majtas.</p>
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

      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3 shadow-sm">
        <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-bold text-blue-700">Shënim:</span> Stacionet e regjistruara do të shfaqen menjëherë në listën e stacioneve mbërritëse dhe nisëse për krijimin e linjave të reja të udhëtimit. Ju lutem siguroni saktësinë e koordinatave gjeografike.
        </p>
      </div>
    </div>
  );
}
