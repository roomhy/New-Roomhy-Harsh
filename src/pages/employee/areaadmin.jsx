import React, { useEffect, useMemo, useState } from "react";
import { useHtmlPage } from "../../utils/htmlPage";

const getApiUrl = () =>
  import.meta.env?.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : "https://roohmy-backend-xwa9.vercel.app");

const WINDOW_NAME_SESSION_PREFIX = "__ROOMHY_STAFF_SESSION__:";

const getStaffUser = () => {
  try {
    const params = new URLSearchParams(window.location.search || "");
    const staff = params.get("staff");
    if (staff) return JSON.parse(decodeURIComponent(staff));
  } catch (e) {
    // ignore
  }

  try {
    const raw =
      sessionStorage.getItem("manager_user") ||
      sessionStorage.getItem("user") ||
      localStorage.getItem("staff_user") ||
      localStorage.getItem("manager_user") ||
      localStorage.getItem("user") ||
      "null";
    const parsed = JSON.parse(raw);
    if (parsed) return parsed;
  } catch (e) {
    // ignore
  }

  try {
    if (typeof window.name === "string" && window.name.startsWith(WINDOW_NAME_SESSION_PREFIX)) {
      const payload = window.name.slice(WINDOW_NAME_SESSION_PREFIX.length);
      return JSON.parse(decodeURIComponent(payload));
    }
  } catch (e) {
    // ignore
  }

  return null;
};

const normalizePermissions = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object") return v.id || v.value || v.key || "";
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

const getEmployeeRecord = (loginId) => {
  if (!loginId) return null;
  const id = String(loginId).toUpperCase();
  try {
    const list = JSON.parse(localStorage.getItem("roomhy_employees") || "[]");
    if (Array.isArray(list)) {
      const found = list.find((e) => String(e.loginId || "").toUpperCase() === id);
      if (found) return found;
    }
  } catch (e) {}
  try {
    const cache = JSON.parse(localStorage.getItem("roomhy_employees_cache") || "[]");
    if (Array.isArray(cache)) {
      const found = cache.find((e) => String(e.loginId || "").toUpperCase() === id);
      if (found) return found;
    }
  } catch (e) {}
  return null;
};

const resolveUserDisplayName = (currentUser, fallbackEmp) => {
  const raw =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.employeeName ||
    currentUser?.managerName ||
    fallbackEmp?.name ||
    fallbackEmp?.fullName ||
    fallbackEmp?.employeeName ||
    fallbackEmp?.managerName ||
    currentUser?.loginId ||
    "User";
  return String(raw || "User");
};

const sidebarConfig = {
  dashboard: { label: "Dashboard", path: "/employee/areaadmin", icon: "layout-dashboard" },
  teams: { label: "Teams", path: "/employee/manager", icon: "map-pin" },
  owners: { label: "Property Owners", path: "/employee/owner", icon: "briefcase" },
  properties: { label: "Properties", path: "/employee/properties", icon: "home" },
  tenants: { label: "Tenants", path: "/employee/tenant", icon: "users" },
  new_signups: { label: "New Signups", path: "/employee/new_signups", icon: "file-badge" },
  web_enquiry: { label: "Web Enquiry", path: "/employee/websiteenq", icon: "folder-open" },
  enquiries: { label: "Enquiries", path: "/employee/enquiry", icon: "help-circle" },
  bookings: { label: "Bookings", path: "/employee/booking", icon: "calendar-check" },
  reviews: { label: "Reviews", path: "/employee/reviews", icon: "star" },
  complaint_history: {
    label: "Complaint History",
    path: "/employee/complaint-history",
    icon: "alert-circle"
  },
  live_properties: { label: "Live Properties", path: "/employee/website", icon: "globe" },
  rent_collections: { label: "Rent Collections", path: "/employee/rentcollection", icon: "wallet" },
  commissions: { label: "Commissions", path: "/employee/platform", icon: "indian-rupee" },
  refunds: { label: "Refunds", path: "/employee/refund", icon: "rotate-ccw" },
  locations: { label: "Locations", path: "/employee/location", icon: "map-pin" },
  visits: { label: "Visit Reports", path: "/employee/visit", icon: "clipboard-list" }
};

const mandatoryPermissions = ["dashboard"];

const mapManagerPermissionsToModules = (permissions = {}) => {
  const allowed = new Set(["dashboard", "properties"]);

  if (permissions?.canViewTenants || permissions?.canAddTenants) {
    allowed.add("tenants");
  }
  if (permissions?.canCollectRent) {
    allowed.add("rent_collections");
  }
  if (permissions?.canViewReports) {
    allowed.add("visits");
    allowed.add("reviews");
  }
  if (permissions?.canManageComplaints) {
    allowed.add("complaint_history");
  }
  if (permissions?.canManageRooms) {
    allowed.add("properties");
  }

  return Array.from(allowed);
};

const mapEmployeePermissionsToModules = (permissions) => {
  const assigned = normalizePermissions(permissions);
  const allowed = new Set(["dashboard"]);

  if (assigned.includes("user_management")) {
    allowed.add("teams");
    allowed.add("owners");
    allowed.add("tenants");
    allowed.add("new_signups");
  }
  if (assigned.includes("property_management")) {
    allowed.add("properties");
    allowed.add("locations");
  }
  if (assigned.includes("accounting")) {
    allowed.add("rent_collections");
    allowed.add("commissions");
    allowed.add("refunds");
  }
  if (assigned.includes("report_analytics")) {
    allowed.add("visits");
    allowed.add("complaint_history");
  }
  if (assigned.includes("booking_leads")) {
    allowed.add("web_enquiry");
    allowed.add("enquiries");
    allowed.add("bookings");
  }
  if (assigned.includes("review")) {
    allowed.add("reviews");
  }
  if (assigned.includes("home")) {
    allowed.add("live_properties");
  }
  
  // also add any direct matches just in case
  assigned.forEach(p => allowed.add(p));

  return Array.from(allowed);
};

const parseCountPayload = (payload) => {
  if (Array.isArray(payload)) return payload.length;
  if (Array.isArray(payload?.data)) return payload.data.length;
  if (Array.isArray(payload?.items)) return payload.items.length;
  if (Array.isArray(payload?.visits)) return payload.visits.length;
  if (Array.isArray(payload?.tenants)) return payload.tenants.length;
  if (Array.isArray(payload?.complaints)) return payload.complaints.length;
  if (typeof payload?.count === "number") return payload.count;
  if (typeof payload?.total === "number") return payload.total;
  if (typeof payload?.totalCount === "number") return payload.totalCount;
  return 0;
};

const normalizeIdentity = (value) => String(value || "").trim().toLowerCase();

const visitBelongsToEmployee = (visit, user) => {
  if (!visit || !user) return false;

  const userIds = [
    user?.loginId,
    user?.staffId,
    user?.id,
    user?._id
  ]
    .map(normalizeIdentity)
    .filter(Boolean);

  const userNames = [
    user?.name,
    user?.fullName,
    user?.employeeName,
    user?.managerName
  ]
    .map(normalizeIdentity)
    .filter(Boolean);

  const visitIds = [
    visit?.staffId,
    visit?.submittedById,
    visit?.employeeId,
    visit?.employee_id,
    visit?.createdBy,
    visit?.created_by,
    visit?.addedBy,
    visit?.added_by,
    visit?.propertyInfo?.staffId,
    visit?.propertyInfo?.submittedById,
    visit?.propertyInfo?.employeeId,
    visit?.propertyInfo?.employee_id,
    visit?.propertyInfo?.createdBy,
    visit?.propertyInfo?.created_by,
    visit?.propertyInfo?.addedBy,
    visit?.propertyInfo?.added_by
  ]
    .map(normalizeIdentity)
    .filter(Boolean);

  const visitNames = [
    visit?.staffName,
    visit?.submittedBy,
    visit?.employeeName,
    visit?.createdByName,
    visit?.addedByName,
    visit?.propertyInfo?.staffName,
    visit?.propertyInfo?.submittedBy,
    visit?.propertyInfo?.employeeName,
    visit?.propertyInfo?.createdByName,
    visit?.propertyInfo?.addedByName
  ]
    .map(normalizeIdentity)
    .filter(Boolean);

  if (userIds.length && visitIds.some((value) => userIds.includes(value))) {
    return true;
  }

  if (userNames.length && visitNames.some((value) => userNames.includes(value))) {
    return true;
  }

  return false;
};

export default function SuperadminAreaadmin() {
  useHtmlPage({
    title: "Roomhy - Area Admin Dashboard",
    bodyClass: "text-slate-800",
    htmlAttrs: { lang: "en" },
    metas: [
      { charset: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" }
    ],
    bases: [],
    links: [
      { href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap", rel: "stylesheet" },
      { rel: "stylesheet", href: "/superadmin/assets/css/areaadmin.css" }
    ],
    styles: [],
    scripts: [
      { src: "https://cdn.tailwindcss.com" },
      { src: "https://unpkg.com/lucide@latest" }
    ],
    inlineScripts: [],
    disableMobileSidebar: true
  });

  const [user, setUser] = useState(null);
  const [allowedModules, setAllowedModules] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerBadge, setHeaderBadge] = useState("Loading...");
  const [displayName, setDisplayName] = useState("User");
  const [roleLabel, setRoleLabel] = useState("AREA ADMIN");
  const [headerRole, setHeaderRole] = useState("Role");
  const [showSalary, setShowSalary] = useState(true);
  const [areaStats, setAreaStats] = useState({
    totalProperties: "-",
    pendingApprovals: "-",
    activeOwners: "-"
  });
  const [widgetCounts, setWidgetCounts] = useState({
    properties: 0,
    tenants: 0,
    complaints: 0,
    visits: 0
  });
  const assignedPropertyLabel =
    user?.assignedProperty?.title ||
    user?.assignedProperty?.name ||
    user?.assignedProperty?.property_name ||
    "Assigned Property";

  useEffect(() => {
    const stored = getStaffUser();
    if (stored && stored.role) stored.role = String(stored.role).toLowerCase();
    if (!stored || !["areamanager", "employee", "manager"].includes(stored.role)) {
      localStorage.removeItem("user");
      localStorage.removeItem("manager_user");
      sessionStorage.removeItem("owner_session");
      window.location.href = "/superadmin/index";
      return;
    }

    // Fetch latest user data from server to ensure permissions are up to date
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      fetch(`${getApiUrl()}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.user) {
            const updatedUser = { ...stored, ...data.user };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            let newAllowed = [];
            if (updatedUser.role === "areamanager") {
              newAllowed = Object.keys(sidebarConfig);
            } else if (updatedUser.role === "manager") {
              newAllowed = mapManagerPermissionsToModules(updatedUser.permissions);
            } else {
              newAllowed = mapEmployeePermissionsToModules(updatedUser.permissions);
            }
            setAllowedModules(newAllowed);
          }
        })
        .catch(err => console.error("Failed to fetch fresh user data:", err));
    }

    if (stored.role === "employee") {
      const empRecord = getEmployeeRecord(stored.loginId);
      if (empRecord) {
        const mergedPerms = normalizePermissions(stored.permissions);
        if (!mergedPerms.length) {
          stored.permissions = normalizePermissions(
            empRecord.permissions || empRecord.modules || empRecord.moduleAccess || empRecord.access
          );
        }
        stored.name = stored.name || empRecord.name || empRecord.fullName || empRecord.employeeName;
        stored.team = stored.team || empRecord.team || empRecord.role || "Employee";
        stored.area = stored.area || empRecord.area || empRecord.areaName || "";
        stored.areaName = stored.areaName || empRecord.areaName || empRecord.area || "";
        stored.city = stored.city || empRecord.city || "";
      }
    }

    const display = resolveUserDisplayName(stored, getEmployeeRecord(stored?.loginId));
    setUser(stored);
    setDisplayName(display);
    setRoleLabel(
      stored.role === "areamanager"
        ? "AREA ADMIN"
        : stored.role === "manager"
          ? "PROPERTY MANAGER"
          : "TEAM MEMBER"
    );
    setHeaderRole(
      stored.role === "employee"
        ? (stored.team || "Employee")
        : stored.role === "manager"
          ? "Assigned Property Manager"
          : "Area Manager"
    );
    setShowSalary(stored.role === "areamanager");

    const assignedPropertyLabel =
      stored?.assignedProperty?.title ||
      stored?.assignedProperty?.name ||
      stored?.assignedProperty?.property_name ||
      "";
    const assignedArea = stored.area || stored.areaName;
    if (stored.role === "manager" && assignedPropertyLabel) {
      setHeaderBadge(assignedPropertyLabel);
    } else if (assignedArea && assignedArea !== "Unassigned" && assignedArea !== "Select Area") {
      setHeaderBadge(stored.city ? `${assignedArea}, ${stored.city}` : assignedArea);
    } else {
      setHeaderBadge(stored.team || "Head Office");
    }

    let allowed = [];
    if (stored.role === "areamanager") {
      allowed = Object.keys(sidebarConfig);
    } else if (stored.role === "manager") {
      allowed = mapManagerPermissionsToModules(stored.permissions);
    } else {
      allowed = mapEmployeePermissionsToModules(stored.permissions);
    }
    setAllowedModules(allowed);
  }, []);

  useEffect(() => {
    window.lucide?.createIcons();
  }, [allowedModules, mobileOpen, displayName, headerBadge, headerRole, areaStats, widgetCounts]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "manager") {
      setAreaStats({
        totalProperties: 1,
        pendingApprovals: "-",
        activeOwners: assignedPropertyLabel
      });
      return;
    }

    const apiUrl = getApiUrl();
    const areaCode = user?.areaCode || user?.area || "";
    if (!areaCode) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch(`${apiUrl}/api/admin/stats?areaCode=${encodeURIComponent(areaCode)}`, {
      signal: controller.signal
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Stats fetch failed"))))
      .then((stats) => {
        setAreaStats({
          totalProperties: stats.totalProperties || 0,
          pendingApprovals: stats.pendingApprovals || stats.enquiryCount || 0,
          activeOwners: stats.activeOwners || 0
        });
      })
      .catch((err) => {
        console.error("Failed to load area stats:", err?.message || err);
        setAreaStats((prev) => ({ ...prev, activeOwners: "N/A" }));
      })
      .finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, [assignedPropertyLabel, user]);

  useEffect(() => {
    if (!user) return;
    const apiUrl = getApiUrl();
    const isEmployee = user?.role === "employee";
    const isManager = user?.role === "manager";
    const visitQuery =
      isEmployee && (user?.loginId || user?.name)
        ? `?staffId=${encodeURIComponent(user?.loginId || "")}&staffName=${encodeURIComponent(user?.name || "")}`
        : "";

    const fetchCount = async (path) => {
      try {
        const res = await fetch(`${apiUrl}${path}`);
        if (!res.ok) return 0;
        const data = await res.json().catch(() => ({}));
        if ((isEmployee || isManager) && path.startsWith("/api/visits")) {
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.visits)
              ? data.visits
              : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.items)
                  ? data.items
                  : [];
          if (list.length) {
            return list.filter((visit) => visitBelongsToEmployee(visit, user)).length;
          }
        }
        return parseCountPayload(data);
      } catch {
        return 0;
      }
    };

    const loadCounts = async () => {
      const [properties, tenants, complaints, visits] = await Promise.all([
        allowedModules.includes("properties") ? (isManager ? 1 : fetchCount("/api/properties")) : 0,
        allowedModules.includes("tenants") ? fetchCount("/api/tenants") : 0,
        allowedModules.includes("complaint_history") ? fetchCount("/api/complaints") : 0,
        allowedModules.includes("visits") ? fetchCount(`/api/visits${visitQuery}`) : 0
      ]);

      let finalVisits = visits;
      if (!finalVisits && allowedModules.includes("visits")) {
        try {
          const localVisits = JSON.parse(localStorage.getItem("roomhy_visit_reports") || "[]");
          finalVisits = Array.isArray(localVisits)
            ? (isEmployee ? localVisits.filter((visit) => visitBelongsToEmployee(visit, user)).length : localVisits.length)
            : 0;
        } catch {}
      }

      setWidgetCounts({
        properties: properties || 0,
        tenants: tenants || 0,
        complaints: complaints || 0,
        visits: finalVisits || 0
      });
    };

    loadCounts();
  }, [allowedModules, user]);

  const dashboardCards = useMemo(
    () =>
      [
        { id: "properties", label: "Properties", desc: "Manage Listings", icon: "home", color: "blue" },
        { id: "tenants", label: "Tenants", desc: "Active Residents", icon: "users", color: "green" },
        { id: "complaint_history", label: "Complaints", desc: "View Issues", icon: "alert-circle", color: "red" },
        { id: "visits", label: "Visit Reports", desc: "Total Visit Reports", icon: "clipboard-list", color: "purple" }
      ].filter((card) => allowedModules.includes(card.id)),
    [allowedModules]
  );

  const renderSection = (label, items, extraClass = "") => {
    const visible = items.filter((item) => allowedModules.includes(item.key));
    if (!visible.length) return null;
    return (
      <div className={extraClass}>
        <div className="px-6 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">{label}</div>
        {visible.map((item) => (
          <a key={item.key} href={item.path} className={`sidebar-link ${item.key === "dashboard" ? "active" : ""}`}>
            <i data-lucide={item.icon} className="w-5 h-5 mr-3"></i> {item.label}
          </a>
        ))}
      </div>
    );
  };

  const navManagement = [
    { key: "teams", ...sidebarConfig.teams },
    { key: "owners", ...sidebarConfig.owners },
    { key: "properties", ...sidebarConfig.properties },
    { key: "tenants", ...sidebarConfig.tenants },
    { key: "new_signups", ...sidebarConfig.new_signups },
    { key: "visits", ...sidebarConfig.visits }
  ];
  const navFinance = [
    { key: "rent_collections", ...sidebarConfig.rent_collections },
    { key: "commissions", ...sidebarConfig.commissions },
    { key: "refunds", ...sidebarConfig.refunds }
  ];
  const navSystem = [
    { key: "web_enquiry", ...sidebarConfig.web_enquiry },
    { key: "enquiries", ...sidebarConfig.enquiries },
    { key: "bookings", ...sidebarConfig.bookings },
    { key: "reviews", ...sidebarConfig.reviews },
    { key: "complaint_history", ...sidebarConfig.complaint_history },
    { key: "live_properties", ...sidebarConfig.live_properties },
    { key: "locations", ...sidebarConfig.locations }
  ];

  const logout = (event) => {
    event?.preventDefault?.();
    localStorage.removeItem("user");
    localStorage.removeItem("manager_user");
    if (typeof window.name === "string" && window.name.startsWith(WINDOW_NAME_SESSION_PREFIX)) {
      window.name = "";
    }
    window.location.href = "/superadmin/index";
  };

  const avatarData = useMemo(() => {
    if (!user) return { initials: "--", color: "bg-purple-500" };
    const nameForAvatar = displayName || user?.loginId || "User";
    const normalized = String(nameForAvatar || "").replace(/\s+/g, "").trim();
    const initials = (normalized ? normalized.slice(0, 2) : "--").toUpperCase();
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"];
    const key = String(user.loginId || "0");
    const colorIdx = key.charCodeAt(0) % colors.length;
    const empRecord = getEmployeeRecord(user.loginId);
    const photoUrl = empRecord?.photoDataUrl || "";
    return { initials, color: colors[colorIdx], photoUrl };
  }, [displayName, user]);

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, <span id="welcomeName">{displayName}</span>!
            </h1>
            <p class="text-lg text-slate-500 mt-2">
              Accessing <span id="welcomeArea" class="font-semibold text-purple-600">{user?.role === "manager" ? assignedPropertyLabel : "Dashboard"}</span>.
            </p>
          </div>

          <div id="areaStatsRow" class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full md:w-auto">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center min-w-[160px]">
              <p class="text-sm font-medium text-slate-500 mb-1">Total Properties</p>
              <h3 id="totalPropertiesCountArea" class="text-3xl font-bold text-slate-900">
                {areaStats.totalProperties}
              </h3>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center min-w-[160px]">
              <p class="text-sm font-medium text-slate-500 mb-1">Pending Approvals</p>
              <h3 id="pendingApprovalsCountArea" class="text-3xl font-bold text-slate-900">
                {areaStats.pendingApprovals}
              </h3>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center min-w-[160px]">
              <p class="text-sm font-medium text-slate-500 mb-1">{user?.role === "manager" ? "Assigned Property" : "Active Owners"}</p>
              <h3 id="activeOwnersCountArea" class={`font-bold text-slate-900 ${user?.role === "manager" ? "text-base leading-snug" : "text-3xl"}`}>
                {areaStats.activeOwners}
              </h3>
            </div>
          </div>
        </div>

        <div id="dashboardWidgetGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dashboardCards.map((card) => (
            <div
              key={card.id}
              class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                const cfg = sidebarConfig[card.id];
                if (cfg?.path) window.location.href = cfg.path;
              }}
            >
              <div class="flex items-center gap-5">
                <div class="p-4 bg-slate-50 rounded-2xl group-hover:bg-purple-50 transition-colors">
                  <i data-lucide={card.icon} class="w-8 h-8 text-slate-600 group-hover:text-purple-600 transition-colors"></i>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.label}</h3>
                  <p class="text-3xl font-bold text-slate-900 mt-1">
                    {card.id === "properties"
                      ? widgetCounts.properties
                      : card.id === "tenants"
                      ? widgetCounts.tenants
                      : card.id === "complaint_history"
                      ? widgetCounts.complaints
                      : widgetCounts.visits}
                  </p>
                  <p class="text-xs text-slate-400 mt-1 font-medium">{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div class="mt-8 p-10 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
          <div class="max-w-md mx-auto">
            <div class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="layers" class="w-8 h-8 text-purple-600"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Select a module from the sidebar</h3>
            <p class="text-slate-500 mt-2">
              Your access is limited to the specific permissions assigned to your Team role.
            </p>
            {allowedModules.includes("visits") ? (
              <div class="mt-8">
                <a
                  href="/employee/visit"
                  class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 transition-all active:scale-95"
                >
                  <i data-lucide="clipboard-list" class="w-5 h-5"></i>
                  Add Visit Report
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
  );
}




