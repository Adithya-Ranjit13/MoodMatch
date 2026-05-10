export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("moodmatch_token");
}

export function saveToken(token: string): void {
  localStorage.setItem("moodmatch_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("moodmatch_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("moodmatch_refresh_token");
}

export function saveRefreshToken(token: string): void {
  localStorage.setItem("moodmatch_refresh_token", token);
}

export function removeRefreshToken(): void {
  localStorage.removeItem("moodmatch_refresh_token");
}