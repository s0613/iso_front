"use client";

import {
  Search as SearchIcon,
  MapPin,
  Gauge,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import CarListHeader from "./CarListHeader";

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  country: string;
  image?: string;
}

interface Request {
  id: string;
  vehicle: Vehicle;
  status: "Pending" | "Paid" | "Issued";
}

export default function CarList() {
  const [vehicles] = useState<Vehicle[]>([
    {
      id: "v1",
      vin: "1HGCM82633A004352",
      make: "Hyundai",
      model: "Sonata",
      year: 2018,
      mileage: 45000,
      country: "USA",
      image: "/cars/sonata.jpg",
    },
    {
      id: "v2",
      vin: "JH4KA8270MC000352",
      make: "Kia",
      model: "Sorento",
      year: 2020,
      mileage: 30000,
      country: "Japan",
      image: "/cars/sorento.jpg",
    },
    {
      id: "v3",
      vin: "3FA6P0H73KR123456",
      make: "Genesis",
      model: "G80",
      year: 2019,
      mileage: 38000,
      country: "Germany",
      image: "/cars/g80.jpg",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const filtered = vehicles.filter(
    (v) =>
      (v.vin.includes(search) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCountry || v.country === filterCountry)
  );

  const handleRequest = useCallback(() => {
    if (!selected) return;
    toast(`${selected.vin} 인증서 요청이 접수되었습니다.`);
  }, [selected]);

  const router = useRouter();

  return (
    <main className="flex-1 px-8 py-8">
      <CarListHeader
        search={search}
        setSearch={setSearch}
        setFilterCountry={setFilterCountry}
        vehicles={vehicles}
      />

      {/* 차량 목록 */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            차량 목록&nbsp;
            <span className="text-blue-600">{filtered.length}대</span>
          </h3>

          {selected && (
            <Button
              onClick={handleRequest}
              className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              인증서 요청
            </Button>
          )}
        </div>

        {/* 반응형 그리드 */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((v) => {
              const isSelected = selected?.id === v.id;
              return (
                <Card
                  key={v.id}
                  role="button"
                  aria-selected={isSelected}
                  onClick={() => router.push(`/cardetail/${v.id}`)}
                  className={`group relative flex flex-row items-center gap-4 overflow-hidden transition-shadow px-4 py-2
                    ${isSelected
                      ? "border-blue-500 shadow-lg bg-blue-50/40"
                      : "hover:shadow-md bg-white hover:border-blue-400 hover:bg-blue-50/60 border border-transparent"}
                    cursor-pointer
                  `}
                >
                  {/* 정보 */}
                  <CardContent className="flex flex-1 flex-row items-center gap-6 p-0 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold truncate">{v.make} {v.model}</h4>
                        <span className="text-xs text-gray-500">{v.year}</span>
                      </div>
                      <div className="font-mono text-xs text-gray-400 truncate">{v.vin}</div>
                    </div>
                    <div className="flex items-center gap-4 ml-auto text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4 text-gray-400" />
                        {v.mileage.toLocaleString()}km
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {v.country}
                      </div>
                    </div>
                  </CardContent>
                  {isSelected && (
                    <span className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-500">
            <SearchIcon className="h-10 w-10" />
            <p className="text-lg">검색 조건에 맞는 차량이 없습니다.</p>
            <p className="text-sm text-gray-400">
              다른 검색어를 입력해보세요.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
