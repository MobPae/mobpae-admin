import api from "../lib/axios";
import type { Membership, MembershipCoupon, MembershipSummary } from "../types/membership";

function unwrapList<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of [...keys, "data", "items", "results"]) {
      if (Array.isArray(r[key])) return r[key] as T[];
    }
  }
  return [];
}

function unwrapItem<T>(data: unknown, keys: string[]): T {
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of [...keys, "data", "item"]) {
      if (r[key] && typeof r[key] === "object") return r[key] as T;
    }
  }
  return data as T;
}

// GET /membership — all memberships (admin)
export async function getMemberships(): Promise<Membership[]> {
  const response = await api.get("/membership");
  return unwrapList<Membership>(response.data, ["memberships", "membership"]);
}

// GET /membership/summary — dashboard stat cards
export async function getMembershipSummary(): Promise<MembershipSummary> {
  const response = await api.get("/membership/summary");
  const raw = unwrapItem<Record<string, unknown>>(response.data, ["summary"]);
  const num = (v: unknown): number => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  return {
    activeMemberships:   num(raw?.activeMemberships  ?? raw?.active),
    pendingMemberships:  num(raw?.pendingMemberships ?? raw?.pending),
    rejectedMemberships: num(raw?.rejectedMemberships ?? raw?.rejected),
    totalRevenue:        raw?.totalRevenue ?? raw?.revenue ?? 0,
  };
}

// GET /membership/pending — pending only
export async function getPendingMemberships(): Promise<Membership[]> {
  const response = await api.get("/membership/pending");
  return unwrapList<Membership>(response.data, ["memberships", "membership"]);
}

// GET /membership/{id}
export async function getMembership(id: string): Promise<Membership> {
  const response = await api.get(`/membership/${id}`);
  return unwrapItem<Membership>(response.data, ["membership"]);
}

// POST /membership/{id}/approve
export async function approveMembership(id: string, remarks?: string): Promise<Membership> {
  const response = await api.post(`/membership/${id}/approve`, remarks ? { remarks } : {});
  return unwrapItem<Membership>(response.data, ["membership"]);
}

// POST /membership/{id}/reject
export async function rejectMembership(id: string, remarks?: string): Promise<Membership> {
  const response = await api.post(`/membership/${id}/reject`, remarks ? { remarks } : {});
  return unwrapItem<Membership>(response.data, ["membership"]);
}

// GET /membership/coupons
export async function getCoupons(): Promise<MembershipCoupon[]> {
  const response = await api.get("/membership/coupons");
  return unwrapList<MembershipCoupon>(response.data, ["coupons"]);
}
