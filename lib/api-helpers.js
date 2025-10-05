import { NextResponse } from "next/server";

export function jsonResponse(data, init = {}) {
  return NextResponse.json(data, init);
}

export function errorResponse(error, status = 500) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || "An unexpected error occurred.";
  console.error("API error:", error);
  return NextResponse.json({ error: message }, { status });
}

export async function parseRequestBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }
  return request.json().catch(() => ({}));
}
