import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearServerQueryClient } from "@/core/react-query";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  clearServerQueryClient();
  return response;
}
