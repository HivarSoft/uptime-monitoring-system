import { BASE_URL } from "../../constants/BASE_URL";
import axios, { AxiosError } from "axios";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handleRequest = async <T>(
  fn: () => Promise<T>
): Promise<{ status: number; data: T | null; error?: string }> => {
  try {
    const data = await fn();
    return { status: 200, data };
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    const status = axiosErr.response?.status ?? 500;
    const error =
      axiosErr.response?.data?.message ?? axiosErr.message ?? "Request failed";
    return { status, data: null, error };
  }
};

export const checkLoggedIn = () =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/auth/checkLogin`, { headers: getAuthHeaders() })
      .then((r) => r.data)
  );

export const Login = (email: string, password: string) =>
  handleRequest(() =>
    axios
      .post(`${BASE_URL}/auth/login`, { email, password })
      .then((r) => r.data)
  );

export const signUp = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) =>
  handleRequest(() =>
    axios
      .post(`${BASE_URL}/auth/signUp`, { firstName, lastName, email, password })
      .then((r) => r.data)
  );

export const getAllProjects = () =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/service/getAllProjects`, { headers: getAuthHeaders() })
      .then((r) => r.data)
  );

export const getAllServices = (projectId: string) =>
  handleRequest(() =>
    axios
      .post(
        `${BASE_URL}/service/getAllServices`,
        { projectId },
        { headers: getAuthHeaders() }
      )
      .then((r) => r.data)
  );

export const createProject = (projectName: string) =>
  handleRequest(() =>
    axios
      .post(
        `${BASE_URL}/service/createProject`,
        { name: projectName },
        { headers: getAuthHeaders() }
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
        { headers: getAuthHeaders() }
      )
      .then((r) => r.data)
  );

export const getServiceById = (id: string, from?: Date, to?: Date) => {
  const params = new URLSearchParams({ limit: "1000" });
  if (from) params.set("from", from.toISOString());
  if (to) params.set("to", to.toISOString());
  return handleRequest(() =>
    axios
      .get(`${BASE_URL}/service/getService/${id}?${params.toString()}`, {
        headers: getAuthHeaders(),
      })
      .then((r) => r.data)
  );
};

export const deleteProject = (projectId: string) =>
  handleRequest(() =>
    axios
      .delete(`${BASE_URL}/service/deleteProject/${projectId}`, {
        headers: getAuthHeaders(),
      })
      .then((r) => r.data)
  );

export const deleteService = (serviceId: string, projectId: string) =>
  handleRequest(() =>
    axios
      .delete(`${BASE_URL}/service/deleteService/${serviceId}/${projectId}`, {
        headers: getAuthHeaders(),
      })
      .then((r) => r.data)
  );

export const getUser = () =>
  handleRequest(() =>
    axios
      .get(`${BASE_URL}/user/getUser`, { headers: getAuthHeaders() })
      .then((r) => r.data)
  );

export const updateUser = (payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
  imgUrl?: string;
}) =>
  handleRequest(() =>
    axios
      .patch(`${BASE_URL}/user/updateUser`, payload, {
        headers: getAuthHeaders(),
      })
      .then((r) => r.data)
  );

export const changePassword = (
  currentPassword: string,
  newPassword: string
) =>
  handleRequest(() =>
    axios
      .patch(
        `${BASE_URL}/user/changePassword`,
        { currentPassword, newPassword },
        { headers: getAuthHeaders() }
      )
      .then((r) => r.data)
  );

// ── Service config ────────────────────────────────────────────────────────────

export const createServiceAdvanced = (payload: {
  projectId: string; serviceName: string; url: string;
  checkIntervalMins?: number; failThreshold?: number;
  recoveryThreshold?: number; alertsEnabled?: boolean; alertChannels?: string[];
}) =>
  handleRequest(() =>
    axios.post(`${BASE_URL}/service/createService`, payload, { headers: getAuthHeaders() })
      .then((r) => r.data)
  );

export const updateService = (serviceId: string, payload: {
  serviceName?: string; url?: string; checkIntervalMins?: number;
  failThreshold?: number; recoveryThreshold?: number;
  alertsEnabled?: boolean; alertChannels?: string[];
}) =>
  handleRequest(() =>
    axios.patch(`${BASE_URL}/service/updateService/${serviceId}`, payload, { headers: getAuthHeaders() })
      .then((r) => r.data)
  );

// ── Alert channels ────────────────────────────────────────────────────────────

export const getAlertChannels = () =>
  handleRequest(() =>
    axios.get(`${BASE_URL}/alerts`, { headers: getAuthHeaders() }).then((r) => r.data)
  );

export const getAlertChannelById = (id: string) =>
  handleRequest(() =>
    axios.get(`${BASE_URL}/alerts/${id}`, { headers: getAuthHeaders() }).then((r) => r.data)
  );

export const createAlertChannel = (payload: {
  name: string; type: string; config: Record<string, unknown>;
}) =>
  handleRequest(() =>
    axios.post(`${BASE_URL}/alerts`, payload, { headers: getAuthHeaders() }).then((r) => r.data)
  );

export const updateAlertChannel = (id: string, payload: {
  name?: string; enabled?: boolean; config?: Record<string, unknown>;
}) =>
  handleRequest(() =>
    axios.patch(`${BASE_URL}/alerts/${id}`, payload, { headers: getAuthHeaders() }).then((r) => r.data)
  );

export const deleteAlertChannel = (id: string) =>
  handleRequest(() =>
    axios.delete(`${BASE_URL}/alerts/${id}`, { headers: getAuthHeaders() }).then((r) => r.data)
  );

export const testAlertChannel = (id: string) =>
  handleRequest(() =>
    axios.post(`${BASE_URL}/alerts/${id}/test`, {}, { headers: getAuthHeaders() }).then((r) => r.data)
  );
