import { NextResponse } from "next/server";

export function jsonOk<T extends Record<string, unknown>>(payload: T) {
  return NextResponse.json({
    ok: true,
    ...payload,
  });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    {
      status,
    }
  );
}

export function unauthorized(message = "You must be logged in.") {
  return jsonError(message, 401);
}

export function forbidden(message = "You do not have permission.") {
  return jsonError(message, 403);
}

export function notFound(message = "Not found.") {
  return jsonError(message, 404);
}

export function serverError(message = "Something went wrong.") {
  return jsonError(message, 500);
}
