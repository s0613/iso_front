"use client"

import {
  Home,
  LogIn,
  LogOut,
  Search as SearchIcon,
  FileText,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/auth"

export default function CarSidebar() {
  const { isLoggedIn, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r px-6 py-8 flex flex-col">
      <Image src="/Totaro_logo.svg" alt="Totaro Logo" width={60} height={60} className="mb-8" />
      <nav className="flex-1 space-y-4">
        <Link href="#" className="flex items-center gap-3 text-gray-700 hover:text-black">
          <Home className="w-5 h-5" /> Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-3 text-gray-700 hover:text-black">
          <SearchIcon className="w-5 h-5" /> 차량조회
        </Link>
        <Link href="#" className="flex items-center gap-3 text-gray-700 hover:text-black">
          <FileText className="w-5 h-5" /> 신청내역
        </Link>
      </nav>
      <Separator className="my-4" />
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:text-red-600 w-full text-left"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      ) : (
        <Link href="/login" className="flex items-center gap-3 text-blue-500 hover:text-blue-600">
          <LogIn className="w-5 h-5" /> Login
        </Link>
      )}
    </aside>
  )
}
