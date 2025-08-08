import { Bell, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface CarListHeaderProps {
  search: string;
  setSearch: (v: string) => void;
  setFilterCountry: (v: string | null) => void;
  vehicles: Vehicle[];
}

export default function CarListHeader({
  search,
  setSearch,
  setFilterCountry,
  vehicles,
}: CarListHeaderProps) {
  return (
    <header className="mb-8 flex flex-row items-center justify-between flex-wrap gap-6">
      {/* 좌측 타이틀 */}
      <div>
        <h2 className="text-2xl font-semibold">인증서 발급 시스템</h2>
      </div>

      {/* 우측 검색·필터·알림·프로필 */}
      <div className="flex flex-row items-center flex-wrap gap-4">
        {/* 검색창 */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="w-64 pl-10"
            placeholder="차대번호 또는 모델명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 국가 필터 */}
        <Select onValueChange={(v) => setFilterCountry(v || null)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="국가 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>수출 국가</SelectLabel>
              {Array.from(new Set(vehicles.map((v) => v.country))).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* 알림 버튼 */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

      </div>
    </header>
  );
}
