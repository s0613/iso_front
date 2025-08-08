"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth";
import { userService } from "./UserService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();

  // 로그인 상태 초기화 확인
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      if (isLoggedIn) {
        router.push("/");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    
    try {
      // 실제 로그인 API 호출
      const loginResponse = await userService.login({ email, password });
      
      // 로그인 성공 시 쿠키 내용 로그로 출력
      if (typeof document !== 'undefined') {
        console.log('🎉 로그인 성공!');
        console.log('👤 사용자 정보:', loginResponse);
        console.log('🍪 현재 쿠키 내용:');
        
        const cookies = document.cookie;
        if (cookies) {
          const cookieArray = cookies.split(';');
          cookieArray.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            console.log(`  ${name}: ${value}`);
          });
        } else {
          console.log('  쿠키가 없습니다.');
        }
        
        // 특정 쿠키들 확인
        const authToken = document.cookie.split(';').find(cookie => cookie.trim().startsWith('auth-token='));
        if (authToken) {
          console.log('🔑 인증 토큰 쿠키:', authToken.trim());
        }
        
        // 세션 스토리지 확인
        console.log('💾 세션 스토리지:', sessionStorage);
        console.log('💾 로컬 스토리지:', localStorage);
      }
      
      // Zustand store에 사용자 정보 저장
      const userData = { 
        email: loginResponse.email, 
        name: loginResponse.email.split('@')[0], // 임시로 이메일에서 이름 추출
        userId: loginResponse.userId.toString(), // number를 string으로 변환
        role: loginResponse.role
      };
      login(userData);
      toast.success("로그인 성공!");
      
      // CarList 페이지로 이동
      router.push("/");
      
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col lg:flex-row">
      {/* 왼쪽 반 - 로고 섹션 */}
      <div className="lg:w-1/2 w-full flex items-center justify-center p-8 lg:p-12">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <Image
                src="/Totaro_logo.svg"
                alt="Totaro Logo"
                width={60}
                height={60}
                className="w-12 h-12 lg:w-16 lg:h-16"
              />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Totaro에 오신 것을 환영합니다
          </h1>
          <p className="text-lg lg:text-xl text-gray-600">
            계정에 로그인하여 서비스를 이용하세요
          </p>
        </div>
      </div>

      {/* 오른쪽 반 - 로그인 폼 */}
      <div className="lg:w-1/2 w-full flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6 px-6 lg:px-8 pt-8">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                로그인
              </CardTitle>
              <CardDescription className="text-center text-gray-600 text-base">
                이메일과 비밀번호를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 lg:px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-base font-medium text-gray-700">
                    이메일
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="password" className="text-base font-medium text-gray-700">
                    비밀번호
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-base text-gray-600">
                      로그인 상태 유지
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-base text-blue-600 hover:underline"
                  >
                    비밀번호 찾기
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 text-base h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      로그인 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </Button>
              </form>

              <div className="text-center pt-6">
                <p className="text-base text-gray-600">
                  계정이 없으신가요?{" "}
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    회원가입
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 푸터 */}
          <div className="text-center mt-6 lg:mt-8">
            <p className="text-sm text-gray-500">
              © 2024 Totaro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
