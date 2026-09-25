/**
 * RaithuSetu API Client Service
 *
 * Base URL priority:
 *  1. VITE_API_BASE_URL env variable (set this in .env.local for dev, or in your
 *     deployment platform's environment settings for production)
 *  2. Falls back to http://127.0.0.1:8000/api for local development only
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'https://raithu-sethu-api.onrender.com/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('raithu_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      let msg = errorData.message || errorData.detail;
      if (!msg) {
        if (errorData.otp) msg = Array.isArray(errorData.otp) ? errorData.otp[0] : errorData.otp;
        else if (errorData.email) msg = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        else if (errorData.phone) msg = Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone;
        else msg = `HTTP ${res.status}`;
      }
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Authentication & Profile
  auth: {
    sendOtp: (data) => {
      const payload = typeof data === 'string' ? (data.includes('@') ? { email: data } : { phone: data }) : data;
      return request('/auth/send-otp/', { method: 'POST', body: JSON.stringify(payload) });
    },
    verifyOtp: (data, maybeOtp) => {
      let payload;
      if (typeof data === 'object') {
        payload = { ...data };
        if (maybeOtp !== undefined) {
          payload.otp = maybeOtp;
        }
      } else {
        payload = typeof data === 'string' && data.includes('@')
          ? { email: data, otp: maybeOtp }
          : { phone: data, otp: maybeOtp };
      }
      return request('/auth/verify-otp/', { method: 'POST', body: JSON.stringify(payload) });
    },
    googleAuth: (data) => request('/auth/google/', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: (param) => {
      let query = '';
      if (param) {
        query = param.includes('@') ? `?email=${encodeURIComponent(param)}` : `?phone=${encodeURIComponent(param)}`;
      }
      return request(`/auth/profile/${query}`);
    },
    updateProfile: (data) => request('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Disease Detection
  disease: {
    analyze: (formData) => {
      const token = localStorage.getItem('raithu_auth_token');
      return fetch(`${API_BASE_URL}/disease-detection/analyze/`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: formData,
      }).then((res) => res.json());
    },
    getHistory: () => request('/disease-detection/history/'),
    getKnowledge: () => request('/disease-detection/knowledge/'),
  },

  // Mandi & Market Prices
  mandi: {
    getPrices: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/market-prices/${query ? `?${query}` : ''}`);
    },
    getSummary: (state) => request(`/market-prices/summary/${state ? `?state=${encodeURIComponent(state)}` : ''}`),
    getFilters: () => request('/market-prices/filters/'),
  },

  // Government Schemes
  schemes: {
    getAll: (category) => request(`/govt-schemes/${category ? `?category=${category}` : ''}`),
    getById: (id) => request(`/govt-schemes/${id}/`),
  },

  // Hyperlocal Weather Advisory (Open-Meteo Powered)
  weather: {
    getCurrent: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/weather/current/${query ? `?${query}` : ''}`);
    },
    getForecast: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/weather/forecast/${query ? `?${query}` : ''}`);
    },
  },

  // Farmer Community Forum
  community: {
    // Posts
    getPosts: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/community/posts/${query ? `?${query}` : ''}`);
    },
    createPost: (formData) => {
      // Accepts either FormData (with image) or plain object
      const token = localStorage.getItem('raithu_auth_token');
      if (formData instanceof FormData) {
        return fetch(`${API_BASE_URL}/community/posts/`, {
          method: 'POST',
          headers: { ...(token && { Authorization: `Token ${token}` }) },
          body: formData,
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || err.content?.[0] || `HTTP ${res.status}`);
          }
          return res.json();
        });
      }
      return request('/community/posts/', { method: 'POST', body: JSON.stringify(formData) });
    },
    getPost: (id) => request(`/community/posts/${id}/`),
    updatePost: (id, data) => request(`/community/posts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    deletePost: (id) => request(`/community/posts/${id}/`, { method: 'DELETE' }),

    // Replies
    getReplies: (postId) => request(`/community/posts/${postId}/replies/`),
    addReply: (postId, content) =>
      request(`/community/posts/${postId}/replies/`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    deleteReply: (replyId) => request(`/community/replies/${replyId}/delete/`, { method: 'DELETE' }),

    // Helpful (idempotent toggle)
    toggleHelpful: (postId) => request(`/community/posts/${postId}/helpful/`, { method: 'POST' }),

    // Legacy like (kept for compat)
    likePost: (id) => request(`/community/posts/${id}/like/`, { method: 'POST' }),

    // Reports
    reportPost: (postId, reason, description = '') =>
      request(`/community/posts/${postId}/report/`, {
        method: 'POST',
        body: JSON.stringify({ reason, description }),
      }),
    reportReply: (replyId, reason, description = '') =>
      request(`/community/replies/${replyId}/report/`, {
        method: 'POST',
        body: JSON.stringify({ reason, description }),
      }),

    // Machinery
    getMachinery: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/community/machinery/${query ? `?${query}` : ''}`);
    },
    createMachinery: (formData) => {
      const token = localStorage.getItem('raithu_auth_token');
      if (formData instanceof FormData) {
        return fetch(`${API_BASE_URL}/community/machinery/`, {
          method: 'POST',
          headers: { ...(token && { Authorization: `Token ${token}` }) },
          body: formData,
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `HTTP ${res.status}`);
          }
          return res.json();
        });
      }
      return request('/community/machinery/', { method: 'POST', body: JSON.stringify(formData) });
    },
    updateMachinery: (id, data) => request(`/community/machinery/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteMachinery: (id) => request(`/community/machinery/${id}/`, { method: 'DELETE' }),
  },
};

export default api;
