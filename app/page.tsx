"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CarList from "@/features/car/CarList"
import Sidebar from "@/components/common/Sidebar"
import { useAuthStore } from "@/lib/auth"

export default function ExportCertApp() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로그인 상태가 초기화될 때까지 잠시 대기
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!isLoggedIn) {
        router.push("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <CarList />
    </div>
  )
}
