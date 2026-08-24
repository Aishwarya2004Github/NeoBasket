import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

// =========================================================
// AXIOS INSTANCE
// =========================================================

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

Axios.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("accesstoken");

    if (accessToken) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// REFRESH ACCESS TOKEN
// IMPORTANT:
// Use separate axios instance so refresh request
// does not trigger the same interceptor again.
// =========================================================

const refreshAccessToken = async (
  refreshToken
) => {
  try {
    const response = await axios({
      method:
        SummaryApi.refreshToken.method || "GET",

      url:
        `${baseURL}${SummaryApi.refreshToken.url}`,

      headers: {
        Authorization:
          `Bearer ${refreshToken}`,
      },

      withCredentials: true,
    });

    const accessToken =
      response?.data?.data?.accessToken;

    if (!accessToken) {
      console.error(
        "Access token missing from refresh response"
      );

      return null;
    }

    localStorage.setItem(
      "accesstoken",
      accessToken
    );

    return accessToken;
  } catch (error) {
    console.error(
      "Refresh token error:",
      error?.response?.data ||
        error?.message
    );

    return null;
  }
};

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

Axios.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest =
      error.config;

    // -----------------------------------------------------
    // No response / no original request
    // -----------------------------------------------------

    if (
      !error.response ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }

    // -----------------------------------------------------
    // Only refresh on 401
    // -----------------------------------------------------

    if (
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // -----------------------------------------------------
    // Prevent infinite retry
    // -----------------------------------------------------

    originalRequest._retry = true;

    // -----------------------------------------------------
    // Get refresh token
    // -----------------------------------------------------

    const refreshToken =
      localStorage.getItem(
        "refreshToken"
      );

    if (!refreshToken) {
      return Promise.reject(error);
    }

    // -----------------------------------------------------
    // Generate new access token
    // -----------------------------------------------------

    const newAccessToken =
      await refreshAccessToken(
        refreshToken
      );

    if (!newAccessToken) {
      // Optional cleanup
      localStorage.removeItem(
        "accesstoken"
      );

      return Promise.reject(error);
    }

    // -----------------------------------------------------
    // Retry original request
    // -----------------------------------------------------

    originalRequest.headers =
      originalRequest.headers || {};

    originalRequest.headers.Authorization =
      `Bearer ${newAccessToken}`;

    return Axios(originalRequest);
  }
);

export default Axios;