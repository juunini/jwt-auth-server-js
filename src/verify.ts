import { verify as jwtVerify } from "jsonwebtoken";

export function verify(token: string, secret: string): boolean {
  try {
    jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
