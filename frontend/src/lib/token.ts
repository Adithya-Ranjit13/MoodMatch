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