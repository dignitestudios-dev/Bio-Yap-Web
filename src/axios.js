import axios from "axios";
import { ErrorToast } from "./components/global/Toaster"; // Import your toaster functions
import Cookies from "js-cookie";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// export const baseUrl = "https://qjp0k3sg-4001.inc1.devtunnels.ms/";
// export const baseUrl = "https://api.bioyap.com";
// export const baseUrl = "https://155e-45-199-187-86.ngrok-free.app";

async function getDeviceFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}

const instance = axios.create({
  baseURL: baseUrl,
  headers: {
    devicemodel: getDeviceFingerprint(),
    deviceuniqueid: getDeviceFingerprint(),
  },
  timeout: 10000, // 10 seconds timeout
});

instance.interceptors.request.use((request) => {
  const token = Cookies.get("token");
  if (!navigator.onLine) {
    // No internet connection
    ErrorToast(
      "No internet connection. Please check your network and try again."
    );
    return;
    // return Promise.reject(new Error("No internet connection"));
  }

  // Merge existing headers with token
  request.headers = {
    ...request.headers, // Keep existing headers like devicemodel and deviceuniqueid
    Accept: "application/json, text/plain, */*",
    ...(token && { Authorization: `${token}` }), // Add Authorization only if token exists
  };

  return request;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      // Slow internet or request timeout
      ErrorToast("Your internet connection is slow. Please try again.");
    }

    // if (error.response && error.response.status === 401) {
    //   // Unauthorized error
    //   Cookies.remove("token");
    //   Cookies.remove("user");
    //   ErrorToast("Session expired. Please relogin");
    //   window.location.href = "/";
    // }

    return Promise.reject(error);
  }
);

export default instance;
