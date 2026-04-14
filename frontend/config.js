const API = "https://code-and-conquer-saas-11g6.onrender.com";

const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = "Bearer " + token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(API + endpoint, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error");
  }

  return data;
}