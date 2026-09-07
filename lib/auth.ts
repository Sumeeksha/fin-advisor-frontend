export interface User {
  user_id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "finadvisor_auth_token";
const USER_KEY = "finadvisor_auth_user";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Authentication failed");
  }

  const data: AuthResponse = await response.json();
  setSession(data.access_token, data.user);
  return data;
}

export async function registerWithEmail(name: string, email: string, password: string, role?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Failed to create account");
  }

  const data: AuthResponse = await response.json();
  setSession(data.access_token, data.user);
  return data;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Invalid email or password" }));
    throw new Error(err.detail || "Login failed");
  }

  const data: AuthResponse = await response.json();
  setSession(data.access_token, data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    const user: User = await response.json();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    return getStoredUser();
  }
}

export async function updateProfile(data: { name?: string; current_password?: string; new_password?: string; role?: string }): Promise<AuthResponse> {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Profile update failed" }));
    throw new Error(err.detail || "Profile update failed");
  }

  const result = await response.json();
  const authResponse: AuthResponse = {
    access_token: result.access_token,
    token_type: "bearer",
    user: result.user
  };
  setSession(authResponse.access_token, authResponse.user);
  return authResponse;
}
