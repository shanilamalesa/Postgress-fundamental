// // client/src/services/api.js
// import axios from "axios";

// const http = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// export async function listLeads({ search = "", status = "", page = 1 } = {}) {
//   const { data } = await http.get("/leads", {
//     params: { search, status, page, pageSize: 25 },
//   });
//   return data;
// }

// export async function getLead(id) {
//   const { data } = await http.get(`/leads/${id}`);
//   return data;
// }

// export async function updateLead(id, patch) {
//   const { data } = await http.patch(`/leads/${id}`, patch);
//   return data;
// }

// export async function getStats() {
//   const { data } = await http.get("/stats");
//   return data;
// }


import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Token helpers
export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

// Attach token to every request automatically
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login({ email, password }) {
  const { data } = await http.post("/auth/login", { email, password });
  saveToken(data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function listLeads({ search = "", status = "", page = 1, assignedTo } = {}) {
  const { data } = await http.get("/leads", {
    params: { search, status, page, pageSize: 25, assignedTo },
  });
  return data;
}

export async function getLead(id) {
  const { data } = await http.get(`/leads/${id}`);
  return data;
}

export async function updateLead(id, patch) {
  const { data } = await http.patch(`/leads/${id}`, patch);
  return data;
}

export async function getStats() {
  const { data } = await http.get("/leads/stats");
  return data;
}

export async function claimLead(id) {
  const { data } = await http.post(`/leads/${id}/claim`);
  return data;
}

export async function getUsers() {
  const { data } = await http.get("/users");
  return data;
}

export async function reassignLead(id, assignedTo) {
  console.log("reassignLead called", id, assignedTo);
  const { data } = await http.patch(`/leads/${id}/assign`, { assignedTo });
  return data;
}