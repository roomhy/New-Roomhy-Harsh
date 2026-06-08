import { getApiBase, getAuthHeader } from './api';
import { cacheGet, cacheSet, cacheInvalidate } from './cache';

const base = () => `${getApiBase()}/api/rent-collection`;

// TTL constants — how long each response is considered fresh
const TTL = {
  CONFIGS:          15 * 60 * 1000, // 15 min — changes only on Save Config
  MISSING_CONTACTS:  5 * 60 * 1000, // 5 min  — changes only when tenants are edited
  DASHBOARD:         2 * 60 * 1000, // 2 min  — changes when payments recorded
  INVOICES:         60 * 1000,      // 60 sec — most volatile
};

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...opts.headers },
    ...opts,
  });
  const data = await res.json().catch(() => ({ success: false, message: 'Invalid JSON response' }));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export function fetchRentDashboard(ownerId) {
  const key = `dashboard:${ownerId}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return apiFetch(`${base()}/dashboard?ownerId=${encodeURIComponent(ownerId)}`)
    .then(data => cacheSet(key, data, TTL.DASHBOARD));
}

// ── Invoices ─────────────────────────────────────────────────────────────────
export function fetchInvoices(params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const key = `invoices:${qs}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return apiFetch(`${base()}/invoices?${qs}`)
    .then(data => cacheSet(key, data, TTL.INVOICES));
}

export const fetchInvoiceById = (id) =>
  apiFetch(`${base()}/invoices/${id}`);

export const generateInvoices = (ownerId, billingMonth, tenants) =>
  apiFetch(`${base()}/invoices/generate`, {
    method: 'POST',
    body: JSON.stringify({ ownerId, billingMonth, tenants }),
  }).then(data => { cacheInvalidate('invoices:'); cacheInvalidate('dashboard:'); return data; });

export const sendReminder = (invoiceId, tenantEmail, tenantName) =>
  apiFetch(`${base()}/invoices/${invoiceId}/remind`, {
    method: 'POST',
    body: JSON.stringify({ tenantEmail, tenantName }),
  });

export const waivePenalty = (invoiceId, reason, waivedAmount) =>
  apiFetch(`${base()}/invoices/${invoiceId}/waive`, {
    method: 'PATCH',
    body: JSON.stringify({ reason, waivedAmount }),
  }).then(data => { cacheInvalidate('invoices:'); cacheInvalidate('dashboard:'); return data; });

// ── Payments ─────────────────────────────────────────────────────────────────
export const recordPayment = (invoiceId, amount, paymentMethod = 'cash', notes = '') =>
  apiFetch(`${base()}/payments`, {
    method: 'POST',
    body: JSON.stringify({ invoiceId, amount, paymentMethod, notes }),
  }).then(data => { cacheInvalidate('invoices:'); cacheInvalidate('dashboard:'); cacheInvalidate('payments:'); return data; });

export function fetchPayments(limit = 200) {
  const key = `payments:all:${limit}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return apiFetch(`${base()}/payments?limit=${limit}`)
    .then(data => cacheSet(key, data, 60 * 1000));
}

// ── Penalty preview ──────────────────────────────────────────────────────────
export const previewPenalty = (rentAmount, ownerId, propertyId, dueDate, paidAmount = 0) =>
  apiFetch(`${base()}/penalty/calculate`, {
    method: 'POST',
    body: JSON.stringify({ rentAmount, ownerId, propertyId, dueDate, paidAmount }),
  });

// ── Penalty configs ──────────────────────────────────────────────────────────
export function fetchPenaltyConfigs(ownerId) {
  const key = `configs:${ownerId}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return apiFetch(`${base()}/configs?ownerId=${encodeURIComponent(ownerId)}`)
    .then(data => cacheSet(key, data, TTL.CONFIGS));
}

export const savePenaltyConfig = (config) =>
  apiFetch(`${base()}/configs`, {
    method: 'POST',
    body: JSON.stringify(config),
  }).then(data => { cacheInvalidate('configs:'); return data; });

// ── Cron health ──────────────────────────────────────────────────────────────
export const fetchCronHealth = () =>
  apiFetch(`${base()}/cron-health`);

// ── Missing contacts ──────────────────────────────────────────────────────────
export function fetchMissingContacts() {
  const key = 'missingContacts';
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return apiFetch(`${base()}/missing-contacts`)
    .then(data => cacheSet(key, data, TTL.MISSING_CONTACTS));
}
