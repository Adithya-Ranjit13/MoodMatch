const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(
  endpoint: string,
  options?: RequestInit
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// Auth specific calls
export async function signupApi(name: string, email: string, password: string) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginApi(email: string, password: string) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}