import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearServerQueryClient, initServerQueryClient } from "@/core/react-query";

export function middleware(request: NextRequest) {
  initServerQueryClient();
  const response = NextResponse.next();
  clearServerQueryClient();
  return response;
}
