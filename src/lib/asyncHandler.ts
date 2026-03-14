import { NextRequest, NextResponse } from "next/server";

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function asyncHandler(handler: (req: NextRequest) => Promise<any>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (err: any) {
      if (err && typeof err.status === "number") {
        if (err.status >= 500) console.error(err);
        else console.warn("[HttpError]", err.status, err.message);
        return NextResponse.json({ message: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  };
}
