// ====================================
// BASE API CLIENT
// ====================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");

    const headers = {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: response.statusText,
      }));

      // Create a detailed error message
      let errorMessage = errorData.error || `API Error: ${response.statusText}`;

      // If there are validation details, include them
      if (errorData.details && Array.isArray(errorData.details)) {
        errorMessage = errorData.details.join("\n");
      } else if (errorData.details && typeof errorData.details === "string") {
        errorMessage = errorData.details;
      }

      const error = new Error(errorMessage);
      // Attach the full error data for advanced error handling
      (error as Error & { data?: unknown }).data = errorData;
      throw error;
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data?: unknown) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data?: unknown) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  },
};
