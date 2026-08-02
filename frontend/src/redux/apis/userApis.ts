/**
 * All API calls use:
 *  - `withCredentials: true` so the browser sends the HttpOnly session cookie
 *  - `X-CSRF-Token` header (read from the csrf_token cookie) on mutating requests
 *
 * No tokens are stored in localStorage.
 */
import { BASE_URL } from "../../constants/BASE_URL";
import axios, { AxiosError } from "axios";

// ── CSRF helper ───────────────────────────────────────────────────────────────

/** Read the csrf_token cookie value (set by the backend after OAuth login) */
const getCsrfToken = (): string => {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1] ?? ""
  );
};

/** Headers for mutating requests (POST / PATCH / DELETE) */
const csrfHeaders = () => ({ "X-CSRF-Token": getCsrfToken() });

// ── Generic request wrapper ───────────────────────────────────────────────────

const handleRequest = async <T>(
  fn: () => Promise<T>
): Promise<{ status: number; data: T | null; error?: string }> => {
  try {
    const data = await fn();
    return { status: 200, data };
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    const status   = axiosErr.response?.status ?? 500;
    const error    =
      axiosErr.response?.data?.message ?? axiosErr.message ?? "Request failed";
    return { status, data: null, error };
  }
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const checkLoggedIn = () =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/auth/checkLogin`, { withCredentials: true })
      .then((r) => r.data)
  );

export const logout = () =>
  handleRequest(() =>
    axios
      .post(
        `${BASE_URL}/auth/logout`,
        {},
        { withCredentials: true, headers: csrfHeaders() }
      )
      .then((r) => r.data)
  );

// ── User ──────────────────────────────────────────────────────────────────────

export const getUser = () =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/user/getUser`, { withCredentials: true })
      .then((r) => r.data)
  );

export const updateUser = (payload: {
  firstName?: string;
  lastName?: string;
  imgUrl?: string;
}) =>
  handleRequest(() =>
    axios
      .patch(`${BASE_URL}/user/updateUser`, payload, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

// ── Services ──────────────────────────────────────────────────────────────────

export const getAllProjects = () =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/service/getAllProjects`, { withCredentials: true })
      .then((r) => r.data)
  );

export const getAllServices = (projectId: string) =>
  handleRequest(() =>
    axios
      .post(
        `${BASE_URL}/service/getAllServices`,
        { projectId },
        { withCredentials: true, headers: csrfHeaders() }
      )
      .then((r) => r.data)
  );

export const createProject = (projectName: string) =>
  handleRequest(() =>
    axios
      .post(
        `${BASE_URL}/service/createProject`,
        { name: projectName },
        { withCredentials: true, headers: csrfHeaders() }
      )
      .then((r) => r.data)
  );

export const createService = (
  serviceName: string,
  url: string,
  projectId: string
) =>
  handleRequest(() =>
    axios
      .post(
        `${BASE_URL}/service/createService`,
        { serviceName, url, projectId },
        { withCredentials: true, headers: csrfHeaders() }
      )
      .then((r) => r.data)
  );

export const getServiceById = (id: string, from?: Date, to?: Date) => {
  const params = new URLSearchParams({ limit: "1000" });
  if (from) params.set("from", from.toISOString());
  if (to)   params.set("to",   to.toISOString());
  return handleRequest(() =>
    axios
      .get(`${BASE_URL}/service/getService/${id}?${params.toString()}`, {
        withCredentials: true,
      })
      .then((r) => r.data)
  );
};

export const deleteProject = (projectId: string) =>
  handleRequest(() =>
    axios
      .delete(`${BASE_URL}/service/deleteProject/${projectId}`, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

export const deleteService = (serviceId: string, projectId: string) =>
  handleRequest(() =>
    axios
      .delete(`${BASE_URL}/service/deleteService/${serviceId}/${projectId}`, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

// ── Service config (advanced) ─────────────────────────────────────────────────

export const createServiceAdvanced = (payload: {
  projectId: string;
  serviceName: string;
  url: string;
  checkIntervalMins?: number;
  failThreshold?: number;
  recoveryThreshold?: number;
  alertsEnabled?: boolean;
  alertChannels?: string[];
}) =>
  handleRequest(() =>
    axios
      .post(`${BASE_URL}/service/createService`, payload, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

export const updateService = (
  serviceId: string,
  payload: {
    serviceName?: string;
    url?: string;
    checkIntervalMins?: number;
    failThreshold?: number;
    recoveryThreshold?: number;
    alertsEnabled?: boolean;
    alertChannels?: string[];
  }
) =>
  handleRequest(() =>
    axios
      .patch(`${BASE_URL}/service/updateService/${serviceId}`, payload, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

// ── Alert channels ────────────────────────────────────────────────────────────

export const getAlertChannels = () =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/alerts`, { withCredentials: true })
      .then((r) => r.data)
  );

export const getAlertChannelById = (id: string) =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/alerts/${id}`, { withCredentials: true })
      .then((r) => r.data)
  );

export const createAlertChannel = (payload: {
  name: string;
  type: string;
  config: Record<string, unknown>;
}) =>
  handleRequest(() =>
    axios
      .post(`${BASE_URL}/alerts`, payload, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

export const updateAlertChannel = (
  id: string,
  payload: { name?: string; enabled?: boolean; config?: Record<string, unknown> }
) =>
  handleRequest(() =>
    axios
      .patch(`${BASE_URL}/alerts/${id}`, payload, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

export const deleteAlertChannel = (id: string) =>
  handleRequest(() =>
    axios
      .delete(`${BASE_URL}/alerts/${id}`, {
        withCredentials: true,
        headers: csrfHeaders(),
      })
      .then((r) => r.data)
  );

export const testAlertChannel = (id: string) =>
  handleRequest(() =>
    axios
      .post(
        `${BASE_URL}/alerts/${id}/test`,
        {},
        { withCredentials: true, headers: csrfHeaders() }
      )
      .then((r) => r.data)
  );
