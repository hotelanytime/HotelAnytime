"use client";

function readCsrfCookie() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)admin-csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function getCsrfToken() {
  const existing = readCsrfCookie();
  if (existing) return existing;

  const response = await fetch('/api/admin/csrf', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get CSRF token');
  }

  const data = await response.json();
  return data?.csrfToken || '';
}
