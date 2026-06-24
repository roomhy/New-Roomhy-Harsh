import { fetchJson, getApiBase } from './api';
import { cacheGet, cacheSet, cacheInvalidate } from './cache';

const base = () => `${getApiBase()}/api/rent-collection`;

// TTL constants — how long each response is considered fresh
const TTL = {
  CONFIGS:          15 * 60 * 1000, // 15 min — changes only on Save Config
  MISSING_CONTACTS:  5 * 60 * 1000, // 5 min  — changes only when tenants are edited
  DASHBOARD:         2 * 60 * 1000, // 2 min  — changes when payments recorded
  INVOICES:         60 * 1000,      // 60 sec — most volatile
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export function fetchRentDashboard(ownerId) {
  const key = `dashboard:${ownerId}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return fetchJson(`${base()}/dashboard?ownerId=${encodeURIComponent(ownerId)}`)
    .then(data => cacheSet(key, data, TTL.DASHBOARD));
}

// ── Invoices ─────────────────────────────────────────────────────────────────
export function fetchInvoices(params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const key = `invoices:${qs}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return fetchJson(`${base()}/invoices?${qs}`)
    .then(data => cacheSet(key, data, TTL.INVOICES));
}

export const fetchInvoiceById = (id) =>
  fetchJson(`${base()}/invoices/${id}`);

export const generateInvoices = (ownerId, billingMonth, tenants) =>
  fetchJson(`${base()}/invoices/generate`, {
    method: 'POST',
    body: JSON.stringify({ ownerId, billingMonth, tenants }),
  }).then(data => { cacheInvalidate('invoices:'); cacheInvalidate('dashboard:'); return data; });

export const sendReminder = (invoiceId, tenantEmail, tenantName) =>
  fetchJson(`${base()}/invoices/${invoiceId}/remind`, {
    method: 'POST',
    body: JSON.stringify({ tenantEmail, tenantName }),
  });

export const waivePenalty = (invoiceId, reason, waivedAmount) =>
  fetchJson(`${base()}/invoices/${invoiceId}/waive`, {
    method: 'PATCH',
    body: JSON.stringify({ reason, waivedAmount }),
  }).then(data => { cacheInvalidate('invoices:'); cacheInvalidate('dashboard:'); return data; });

// ── Payments ─────────────────────────────────────────────────────────────────
export const recordPayment = (invoiceId, amount, paymentMethod = 'cash', notes = '') =>
  fetchJson(`${base()}/payments`, {
    method: 'POST',
    body: JSON.stringify({ invoiceId, amount, paymentMethod, notes }),
  }).then(data => { cacheInvalidate('invoices:'); cacheInvalidate('dashboard:'); cacheInvalidate('payments:'); return data; });

export function fetchPayments(ownerId, limit = 200) {
  const key = `payments:all:${ownerId}:${limit}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return fetchJson(`${base()}/payments?limit=${limit}`)
    .then(data => cacheSet(key, data, 60 * 1000));
}

// ── Penalty preview ──────────────────────────────────────────────────────────
export const previewPenalty = (rentAmount, ownerId, propertyId, dueDate, paidAmount = 0) =>
  fetchJson(`${base()}/penalty/calculate`, {
    method: 'POST',
    body: JSON.stringify({ rentAmount, ownerId, propertyId, dueDate, paidAmount }),
  });

// ── Penalty configs ──────────────────────────────────────────────────────────
export function fetchPenaltyConfigs(ownerId) {
  const key = `configs:${ownerId}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return fetchJson(`${base()}/configs?ownerId=${encodeURIComponent(ownerId)}`)
    .then(data => cacheSet(key, data, TTL.CONFIGS));
}

export const savePenaltyConfig = (config) =>
  fetchJson(`${base()}/configs`, {
    method: 'POST',
    body: JSON.stringify(config),
  }).then(data => { cacheInvalidate('configs:'); return data; });

// ── Cron health ──────────────────────────────────────────────────────────────
export const fetchCronHealth = () =>
  fetchJson(`${base()}/cron-health`);

// ── Missing contacts ──────────────────────────────────────────────────────────
export function fetchMissingContacts(ownerId) {
  const key = `missingContacts:${ownerId}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);
  return fetchJson(`${base()}/missing-contacts`)
    .then(data => cacheSet(key, data, TTL.MISSING_CONTACTS));
}
