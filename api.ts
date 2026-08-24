/**
 * API client for the ComfyGo FastAPI backend.
 * Handles JWT auth via httpOnly cookies.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("admin_token")
      : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const { headers: _, ...restOptions } = options;
  const res = await fetch(url, {
    credentials: "include",
    headers,
    ...restOptions,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// ─── Auth ───────────────────────────────────────────

export async function login(email: string, password: string) {
  return request<{
    access_token: string;
    role: string;
    user_id: string;
    user_name: string;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signupTourist(data: {
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  password: string;
  confirm_password: string;
}) {
  return request<{
    access_token: string;
    role: string;
    user_id: string;
    user_name: string;
  }>("/api/auth/signup/tourist", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signupGuide(data: {
  guide_nid: string;
  guide_name: string;
  guide_email: string;
  guide_mobile: string;
  guide_division: string;
  guide_district: string;
  password: string;
  confirm_password: string;
}) {
  return request<{
    access_token: string;
    role: string;
    user_id: string;
    user_name: string;
  }>("/api/auth/signup/guide", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signupManager(data: {
  manager_id: string;
  manager_name: string;
  manager_email: string;
  manager_mobile: string;
  hotel_registration_number: string;
  password: string;
  confirm_password: string;
}) {
  return request<{
    access_token: string;
    role: string;
    user_id: string;
    user_name: string;
  }>("/api/auth/signup/manager", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(email: string) {
  return request<{ message: string; token: string; type: string }>(
    "/api/auth/forgot-password",
    { method: "POST", body: JSON.stringify({ email }) }
  );
}

export async function resetPassword(
  token: string,
  new_password: string,
  confirm_password: string
) {
  return request<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password, confirm_password }),
  });
}

export async function logout() {
  return request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

// ─── Tourist ────────────────────────────────────────

export async function getTouristProfile() {
  return request<{
    user_id: string;
    user_email: string;
    user_name: string;
    user_phone: string;
  }>("/api/tourist/profile");
}

export async function updateTouristProfile(data: {
  user_name: string;
  user_email: string;
  user_phone: string;
}) {
  return request<{ message: string }>("/api/tourist/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getTransports(route?: string) {
  const params = route ? `?route=${encodeURIComponent(route)}` : "";
  return request<any[]>(`/api/tourist/transports${params}`);
}

export async function getHotels(division?: string) {
  const params = division ? `?division=${encodeURIComponent(division)}` : "";
  return request<any[]>(`/api/tourist/hotels${params}`);
}

export async function getGuides(guide_division?: string) {
  const params = guide_division
    ? `?guide_division=${encodeURIComponent(guide_division)}`
    : "";
  return request<any[]>(`/api/tourist/guides${params}`);
}

export async function getTouristBookings() {
  return request<any[]>("/api/tourist/bookings");
}

export async function bookTransport(transport_id: string, travel_date: string) {
  return request<{ message: string; booking_id: string }>(
    "/api/tourist/book/transport",
    { method: "POST", body: JSON.stringify({ transport_id, travel_date }) }
  );
}

export async function bookHotel(hotel_reg: string, checkin: string) {
  return request<{ message: string; booking_id: string }>(
    "/api/tourist/book/hotel",
    { method: "POST", body: JSON.stringify({ hotel_reg, checkin }) }
  );
}

export async function bookGuide(guide_nid: string, guide_date: string) {
  return request<{ message: string; booking_id: string }>(
    "/api/tourist/book/guide",
    { method: "POST", body: JSON.stringify({ guide_nid, guide_date }) }
  );
}

// ─── Guide ──────────────────────────────────────────

export async function getGuideProfile() {
  return request<any>("/api/guide/profile");
}

export async function updateGuideProfile(data: any) {
  return request<{ message: string }>("/api/guide/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getGuidePendingBookings() {
  return request<any[]>("/api/guide/bookings/pending");
}

export async function getGuideBookingHistory() {
  return request<any[]>("/api/guide/bookings/history");
}

export async function approveGuideBooking(booking_id: string) {
  return request<{ message: string }>("/api/guide/bookings/approve", {
    method: "POST",
    body: JSON.stringify({ booking_id }),
  });
}

export async function rejectGuideBooking(booking_id: string) {
  return request<{ message: string }>("/api/guide/bookings/reject", {
    method: "POST",
    body: JSON.stringify({ booking_id }),
  });
}

// ─── Manager ────────────────────────────────────────

export async function getManagerProfile() {
  return request<any>("/api/manager/profile");
}

export async function updateManagerProfile(data: any) {
  return request<{ message: string }>("/api/manager/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateManagerHotel(data: any) {
  return request<{ message: string }>("/api/manager/hotel", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getManagerPendingBookings() {
  return request<any[]>("/api/manager/bookings/pending");
}

export async function getManagerBookingHistory() {
  return request<any[]>("/api/manager/bookings/history");
}

export async function approveManagerBooking(booking_id: string) {
  return request<{ message: string }>("/api/manager/bookings/approve", {
    method: "POST",
    body: JSON.stringify({ booking_id }),
  });
}

export async function rejectManagerBooking(booking_id: string) {
  return request<{ message: string }>("/api/manager/bookings/reject", {
    method: "POST",
    body: JSON.stringify({ booking_id }),
  });
}

// ─── Public ─────────────────────────────────────────

export async function getDestinations() {
  return request<{
    city_spots: Record<string, any[]>;
    hotel_prices: Record<string, number>;
    guide_rates: Record<string, number>;
    transport_modes: Record<string, Record<string, number>>;
  }>("/api/public/destinations");
}

export async function submitContact(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  return request<{ message: string }>("/api/public/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Admin ──────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  return request<{
    access_token: string;
    role: string;
    user_id: string;
    user_name: string;
    admin_id?: string;
    admin_name?: string;
  }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminStats() {
  return request<any>("/api/admin/stats");
}

export async function getAdminUsers() {
  return request<any[]>("/api/admin/users");
}

export async function getAdminGuides() {
  return request<any[]>("/api/admin/guides");
}

export async function getAdminManagers() {
  return request<any[]>("/api/admin/managers");
}

export async function getAdminBookings() {
  return request<any[]>("/api/admin/bookings");
}

export async function getAdminPayments() {
  return request<any[]>("/api/admin/payments");
}

export async function getAdminHotels() {
  return request<any[]>("/api/admin/hotels");
}

export async function getAdminTransports() {
  return request<any[]>("/api/admin/transports");
}

export async function getAdminSpots() {
  return request<any[]>("/api/admin/spots");
}

export async function getAdminMessages() {
  return request<any[]>("/api/admin/messages");
}

export async function getAdminPackages() {
  return request<any[]>("/api/admin/packages");
}

export async function getAdminSubscriptions() {
  return request<any[]>("/api/admin/subscriptions");
}

export async function voidBooking(booking_id: string) {
  return request<{ message: string }>(
    `/api/admin/bookings/${booking_id}/void`,
    { method: "POST" }
  );
}

export async function refundPayment(payment_id: string) {
  return request<{ message: string }>(
    `/api/admin/payments/${payment_id}/refund`,
    { method: "POST" }
  );
}

export async function deleteAdminEntity(
  entity: string,
  id: string
) {
  return request<{ message: string }>(`/api/admin/${entity}/${id}`, {
    method: "DELETE",
  });
}

export async function createAdminEntity(entity: string, data: any) {
  return request<{ message: string }>(`/api/admin/${entity}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminEntity(
  entity: string,
  id: string,
  data: any
) {
  return request<{ message: string }>(`/api/admin/${entity}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getAdminChartData() {
  return request<any>("/api/admin/charts");
}

// ─── Tourist Packages ──────────────────────────────

export async function getTouristPackages() {
  return request<any[]>("/api/tourist/packages");
}

export async function getMyPackage() {
  return request<any | null>("/api/tourist/my-package");
}

export async function purchasePackage(package_id: string) {
  return request<{ message: string; package_id: string }>(
    "/api/tourist/purchase-package",
    { method: "POST", body: JSON.stringify({ package_id }) }
  );
}
