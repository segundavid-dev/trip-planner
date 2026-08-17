import axios from "axios";
import type { ApiError, FieldErrors } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0;
    const data = axios.isAxiosError(error)
      ? (error.response?.data as Record<string, unknown> | undefined)
      : undefined;

    const apiError: ApiError = {
      status,
      message: "Something went wrong. Please try again.",
    };

    if (data) {
      const errorMessage = data.error;
      if (typeof errorMessage === "string") {
        apiError.message = errorMessage;
      } else {
        const fieldErrors: FieldErrors = {};
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            fieldErrors[key] = value.map(String);
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          apiError.fieldErrors = fieldErrors;
          const firstMessage = Object.values(fieldErrors)[0]?.[0];
          if (firstMessage) {
            apiError.message = firstMessage;
          }
        }
      }
    }

    return Promise.reject(apiError);
  },
);

export default apiClient;