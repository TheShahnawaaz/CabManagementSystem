const API_BASE =
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  return response.json();
};

export const getPublicConfig = () => fetchJson('/api/config/public');
export const getHalls = () => fetchJson('/api/bookings/halls');
export const getTrips = () => fetchJson('/api/bookings/trips');
export const createBooking = (payload) => fetchJson('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
export const classifyScan = ({ tripId, scanTime }) =>
  fetchJson(`/api/scans/${tripId}/scan`, { method: 'POST', body: JSON.stringify({ scanTime }) });
export const getScanRule = (tripId) => fetchJson(`/api/scans/${tripId}/rule`);
export const adminLogin = (payload) => fetchJson('/api/admin/login', { method: 'POST', body: JSON.stringify(payload) });
export const getDemand = () => fetchJson('/api/admin/demand');
export const runAllocations = () => fetchJson('/api/admin/allocations', { method: 'POST' });
export const getAllocations = () => fetchJson('/api/admin/allocations');

export { API_BASE };
