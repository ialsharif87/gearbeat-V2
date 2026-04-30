import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";

const MIN_CRON_SECRET_LENGTH = 12;

function getExpectedCronSecret() {
  return process.env.CRON_SECRET?.trim() ?? "";
}

function getProvidedCronSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization")?.trim();

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return (
    request.headers.get("x-cron-secret")?.trim() ??
    request.nextUrl.searchParams.get("secret")?.trim() ??
    ""
  );
}

export function isAuthorizedCronRequest(request: NextRequest) {
  const expectedSecret = getExpectedCronSecret();

  if (!expectedSecret || expectedSecret.length < MIN_CRON_SECRET_LENGTH) {
    return false;
  }

  const providedSecret = getProvidedCronSecret(request);
  return providedSecret === expectedSecret;
}

export function rejectUnauthorizedCronRequest() {
  return NextResponse.json(
    {
      error: "Unauthorized cron request",
      code: "CRON_UNAUTHORIZED",
    },
    { status: 401 },
  );
}

export function requireCronRequest(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    throw new AppError("CRON_UNAUTHORIZED", "Unauthorized cron request", 401);
  }
}

export function getCronAuthFailureResponse(request: NextRequest) {
  return isAuthorizedCronRequest(request) ? null : rejectUnauthorizedCronRequest();
}
