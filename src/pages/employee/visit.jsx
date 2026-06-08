import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHtmlPage } from "../../utils/htmlPage";
import { fetchJson, getAuthHeader } from "../../utils/api";
import {
  Plus, ClipboardCheck, Clock, CheckCircle2, Camera, Search, RefreshCw,
  Building2, Map, Trash, Edit3, Star, MapPin, X, ClipboardList, FileText,
  Images, ImageOff, Upload, LayoutPanelTop, Droplets, BedDouble, CameraOff,
  PlusCircle, UserPlus, Send, Check, ArrowLeft, ArrowRight, ImagePlus,
  UploadCloud, Trash2, RotateCw
} from "lucide-react";

const readStoredUser = () => {
  try {
    const raw =
      sessionStorage.getItem("manager_user") ||
      sessionStorage.getItem("user") ||
      localStorage.getItem("manager_user") ||
      localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

const normalizeVisit = (visit) => {
  const stableId = visit?.visitId || visit?._id || "";
  return {
    ...visit,
    _id: stableId,
    visitId: visit.visitId || stableId
  };
};

const pickFirstText = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
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
    user?.staffName,
    user?.fullName,
    user?.employeeName
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

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const watermarkDataUrl = (dataUrl, areaName, visitDate) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const text = `RoomHy | ${areaName || "Area"} | ${visitDate}`;
      const fontSize = Math.max(16, Math.floor(canvas.width / 40));
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textBaseline = "bottom";
      const padding = 10;
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(padding - 6, canvas.height - fontSize - padding - 6, textWidth + 12, fontSize + 12);
      ctx.fillStyle = "white";
      ctx.fillText(text, padding, canvas.height - padding);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });

export default function Visit() {
  useHtmlPage({
    title: "Roomhy - Visit Reports",
    bodyClass: "text-slate-800",
    htmlAttrs: { lang: "en" },
    metas: [{ charset: "UTF-8" }, { name: "viewport", content: "width=device-width, initial-scale=1.0" }],
    links: [
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: "/superadmin/assets/css/visit.css" }
    ],
    scripts: [
      { src: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js" }
    ],
    inlineScripts: []
  });

  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [geo, setGeo] = useState({ lat: "", lng: "" });
  const [fieldPhotos, setFieldPhotos] = useState([]);
  const [profPhotos, setProfPhotos] = useState([]);
  const [visitId, setVisitId] = useState("");
  const [visitDateDisplay, setVisitDateDisplay] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [visitorsAllowed, setVisitorsAllowed] = useState("Yes");
  const [cookingAllowed, setCookingAllowed] = useState("Yes");
  const [smokingAllowed, setSmokingAllowed] = useState("No");
  const [petsAllowed, setPetsAllowed] = useState("No");
  const [cleanlinessRating, setCleanlinessRating] = useState("");
  const [ownerBehaviourPublic, setOwnerBehaviourPublic] = useState("");
  const [studentReviewsRating, setStudentReviewsRating] = useState("");
  const [employeeRating, setEmployeeRating] = useState("");
  const [captureGroups, setCaptureGroups] = useState({
    photo_building: [],
    photo_room: [],
    photo_bathroom: [],
    photo_bed: [],
    photo_extra: []
  });
  const [step, setStep] = useState(1);
  const [showProfModal, setShowProfModal] = useState(false);
  const [profPreview, setProfPreview] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraView, setCameraView] = useState("capture");
  const [cameraKey, setCameraKey] = useState("");
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraLocation, setCameraLocation] = useState("");
  const [previewLocation, setPreviewLocation] = useState("");
  const [capturedPreview, setCapturedPreview] = useState("");
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState("");
  const [resolvedAreaName, setResolvedAreaName] = useState("");
  const [resolvedCityName, setResolvedCityName] = useState("");
  const [editingVisit, setEditingVisit] = useState(null);
  const [modalAreaName, setModalAreaName] = useState("");
  const [modalCityName, setModalCityName] = useState("");
  const cameraStreamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const formRef = useRef(null);
  const [formSnapshot, setFormSnapshot] = useState({});

  const staffName = user?.name || user?.staffName || user?.fullName || "Manager";
  const staffId = user?.loginId || user?.staffId || user?.id || user?._id || "";
  const areaName = modalAreaName || resolvedAreaName;

  const loadVisits = async () => {
    try {
      setErrorMsg("");
      const query = staffId || staffName ? `?staffId=${encodeURIComponent(staffId)}&staffName=${encodeURIComponent(staffName)}` : "";
      const data = await fetchJson(`/api/visits${query}`);
      const list = (data?.visits || data || [])
        .map(normalizeVisit)
        .filter((visit) => visitBelongsToEmployee(visit, user || { loginId: staffId, name: staffName }));
      setVisits(list);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err?.body || err?.message || "Failed to load visits");
    }
  };

  const loadAddedVisits = async () => {
    try {
      const data = await fetchJson("/api/property-enquiries");
      const list = data?.enquiries || [];
      const ids = new Set(list.map((e) => e.visitId || e.enquiryId).filter(Boolean));
      setAddedVisitIds(ids);
    } catch (err) {
      console.error("Failed to load property enquiries for buttons:", err);
      try {
        const local = JSON.parse(localStorage.getItem("roomhy_property_enquiries") || "[]");
        setAddedVisitIds(new Set(local.map((e) => e.visitId || e.enquiryId).filter(Boolean)));
      } catch (_) {}
    }
  };

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    let active = true;

    const resolveAssignedLocation = async () => {
      const directArea = pickFirstText(
        user?.areaName,
        user?.location,
        user?.area,
        user?.assignedArea,
        user?.locationName,
        user?.team,
        user?.city
      );
      const directCity = pickFirstText(
        user?.city,
        user?.cityName,
        user?.assignedCity
      );

      if (directArea || directCity) {
        if (!active) return;
        setResolvedAreaName(directArea);
        setResolvedCityName(directCity);
        setModalAreaName((current) => current || directArea);
        setModalCityName((current) => current || directCity);
        return;
      }

      const areaCode = pickFirstText(user?.areaCode, user?.locationCode);
      if (!areaCode) {
        if (!active) return;
        setResolvedAreaName("");
        setResolvedCityName("");
        return;
      }

      try {
        const data = await fetchJson("/api/locations/areas");
        const areas = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        const matchedArea = areas.find((area) => {
          const code = pickFirstText(area?.code, area?.areaCode, area?.locationCode, area?.pincode);
          return code && code.toLowerCase() === areaCode.toLowerCase();
        });

        if (!active) return;

        setResolvedAreaName(pickFirstText(matchedArea?.name, matchedArea?.areaName, directArea));
        setResolvedCityName(
          pickFirstText(
            matchedArea?.cityName,
            matchedArea?.city?.name,
            typeof matchedArea?.city === "string" ? matchedArea.city : "",
            directCity
          )
        );
      } catch (_) {
        if (!active) return;
        setResolvedAreaName(directArea);
        setResolvedCityName(directCity);
      }
    };

    resolveAssignedLocation();
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadVisits();
    loadAddedVisits();
    const interval = setInterval(() => {
      loadVisits();
      loadAddedVisits();
    }, 15000);
    return () => clearInterval(interval);
  }, [staffId, staffName, user]);



  const generatePropertyId = () => {
    const id = `PROP${Date.now()}`;
    setPropertyId(id);
  };

  const resetModalDefaults = () => {
    const now = new Date();
    const newVisitId = `v_${Date.now()}`;
    setVisitId(newVisitId);
    setVisitDateDisplay(now.toLocaleString());
    generatePropertyId();
    setVisitorsAllowed("Yes");
    setCookingAllowed("Yes");
    setSmokingAllowed("No");
    setPetsAllowed("No");
    setCleanlinessRating("");
    setOwnerBehaviourPublic("");
    setStudentReviewsRating("");
    setEmployeeRating("");
    setCaptureGroups({
      photo_building: [],
      photo_room: [],
      photo_bathroom: [],
      photo_bed: [],
      photo_extra: []
    });
    setFieldPhotos([]);
    setProfPhotos([]);
    setProfPreview([]);
    setLocationCode(user?.areaCode || user?.locationCode || "");
    setEditingVisit(null);
    setModalAreaName(resolvedAreaName || "");
    setModalCityName(resolvedCityName || "");
  };

  const openModal = () => {
    resetModalDefaults();
    setStep(1);
    setShowModal(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGeo({ lat: "", lng: "" }),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  };

  const closeModal = () => { setShowModal(false); setStep(1); };

  const openEditModal = (visit) => {
    const record = normalizeVisit(visit);
    setEditingVisit(record);
    setVisitId(record.visitId || record._id || "");
    setVisitDateDisplay(record.visitDateDisplay || (record.submittedAt ? new Date(record.submittedAt).toLocaleString() : new Date().toLocaleString()));
    setPropertyId(record.propertyId || "");
    setLocationCode(record.locationCode || user?.areaCode || user?.locationCode || "");
    setVisitorsAllowed(record.visitorsAllowed === false ? "No" : "Yes");
    setCookingAllowed(record.cookingAllowed === false ? "No" : "Yes");
    setSmokingAllowed(record.smokingAllowed === true ? "Yes" : "No");
    setPetsAllowed(record.petsAllowed === true ? "Yes" : "No");
    setCleanlinessRating(String(record.cleanlinessRating || ""));
    setOwnerBehaviourPublic(record.ownerBehaviourPublic || "");
    setStudentReviewsRating(String(record.studentReviewsRating || ""));
    setEmployeeRating(String(record.employeeRating || ""));
    setCaptureGroups({
      photo_building: [],
      photo_room: [],
      photo_bathroom: [],
      photo_bed: [],
      photo_extra: []
    });
    setFieldPhotos(Array.isArray(record.photos) ? record.photos : []);
    setProfPhotos(Array.isArray(record.professionalPhotos) ? record.professionalPhotos : []);
    setProfPreview(Array.isArray(record.professionalPhotos) ? record.professionalPhotos : []);
    setGeo({ lat: record.latitude || "", lng: record.longitude || "" });
    setModalAreaName(record.area || record.areaLocality || record.propertyInfo?.area || resolvedAreaName || "");
    setModalCityName(record.city || record.propertyInfo?.city || resolvedCityName || "");
    setStep(1);
    setShowModal(true);
    // bank fields are defaultValue-driven in JSX via editingVisit reference
  };

  const deleteVisit = async (visit) => {
    const targetId = visit?.visitId || visit?._id;
    if (!targetId) return;
    if (!window.confirm("Delete this visit report?")) return;
    try {
      await fetchJson(`/api/visits/${encodeURIComponent(targetId)}`, { method: "DELETE" });
      await loadVisits();
    } catch (err) {
      window.alert(err?.body || err?.message || "Failed to delete visit");
    }
  };

  const setToggleValue = (field, value) => {
    if (field === "visitorsAllowed") setVisitorsAllowed(value);
    if (field === "cookingAllowed") setCookingAllowed(value);
    if (field === "smokingAllowed") setSmokingAllowed(value);
    if (field === "petsAllowed") setPetsAllowed(value);
  };

  const handleStarClick = (value, field) => {
    if (field === "cleanlinessRating") setCleanlinessRating(String(value));
    if (field === "studentReviewsRating") setStudentReviewsRating(String(value));
    if (field === "employeeRating") setEmployeeRating(String(value));
  };

  const setOwnerBehaviour = (value) => setOwnerBehaviourPublic(value);

  const renderStars = (value, field) => (
    <div className="flex gap-1 text-2xl cursor-pointer">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={`${field}-${n}`}
          className={`star ${Number(value) >= n ? "text-yellow-400" : "text-gray-300"}`}
          onClick={() => handleStarClick(n, field)}
        >
          {Number(value) >= n ? "\u2605" : "\u2606"}
        </span>
      ))}
    </div>
  );

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  };

  useEffect(() => () => stopCameraStream(), []);

  const startCamera = async (facing = cameraFacing) => {
    try {
      setCameraError("");
      setCameraLoading(true);
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing }
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraLoading(false);
    } catch (err) {
      setCameraLoading(false);
      setCameraError("Camera access denied or unavailable. Please allow camera permissions.");
    }
  };

  const openCamera = async (key) => {
    setCameraKey(key);
    setCapturedPreview("");
    setCameraView("capture");
    setShowCamera(true);
    setCameraLoading(true);
    setCameraError("");
    setCameraLocation("");
    setPreviewLocation("");

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
            setCameraLocation(loc);
            setPreviewLocation(loc);
          },
          () => {
            setCameraLocation("Location unavailable");
            setPreviewLocation("Location unavailable");
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      }
    } catch (_) {}

    await startCamera(cameraFacing);
  };

  const closeCamera = () => {
    stopCameraStream();
    setShowCamera(false);
    setCameraView("capture");
    setCameraKey("");
    setCapturedPreview("");
  };

  const toggleCamera = async () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    await startCamera(nextFacing);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPreview(dataUrl);
    setCameraView("preview");
  };

  const recapturePhoto = () => {
    setCapturedPreview("");
    setCameraView("capture");
  };

  const deleteCapture = () => {
    setCapturedPreview("");
    closeCamera();
  };

  const confirmCapture = async () => {
    if (!capturedPreview || !cameraKey) return;
    const maxCount = cameraKey === "photo_extra" ? 11 : 5;
    const existing = captureGroups[cameraKey] || [];
    if (existing.length >= maxCount) {
      alert(`Maximum ${maxCount} photos allowed for this section.`);
      return;
    }
    const stamped = await watermarkDataUrl(
      capturedPreview,
      areaName,
      visitDateDisplay || new Date().toLocaleDateString()
    );
    setCaptureGroups((prev) => ({
      ...prev,
      [cameraKey]: [...existing, stamped]
    }));
    closeCamera();
  };

  const openProfModal = () => {
    setShowProfModal(true);
    setProfPreview(profPhotos.slice());
  };

  const closeProfModal = () => {
    setShowProfModal(false);
    setProfPreview([]);
  };

  const handleProfInput = async (files) => {
    if (!files || files.length === 0) return;
    const existing = profPreview.slice();
    const remaining = 10 - existing.length;
    const toRead = Array.from(files).slice(0, remaining);
    const list = [];
    for (const file of toRead) {
      const dataUrl = await toDataUrl(file);
      list.push(dataUrl);
    }
    setProfPreview([...existing, ...list]);
  };

  const removeProfPhoto = (index) => {
    setProfPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const saveProfPhotos = () => {
    setProfPhotos(profPreview.slice());
    setShowProfModal(false);
  };

  const handleFieldPhotos = async (files) => {
    const list = [];
    const now = new Date().toLocaleString();
    for (const file of files) {
      const dataUrl = await toDataUrl(file);
      const watermarked = await watermarkDataUrl(dataUrl, areaName, now);
      list.push(watermarked);
    }
    setFieldPhotos(list);
  };

  const handleProfPhotos = async (files) => {
    const list = [];
    for (const file of files) {
      const dataUrl = await toDataUrl(file);
      list.push(dataUrl);
    }
    setProfPhotos(list);
  };

  const handleContinue = () => {
    if (formRef.current) {
      const fd = new FormData(formRef.current);
      let patch = {};
      if (step === 1) {
        patch = { propertyType: fd.get("propertyType") || "PG" };
      } else if (step === 2) {
        patch = {
          name: fd.get("name") || "",
          address: fd.get("address") || "",
          gender: fd.get("gender") || "",
          landmark: fd.get("landmark") || "",
          nearbyLocation: fd.get("nearbyLocation") || "",
          ownerName: fd.get("ownerName") || "",
          contactPhone: fd.get("contactPhone") || "",
          ownerEmail: fd.get("ownerEmail") || "",
          amenities: fd.getAll("amenities"),
          monthlyRent: fd.get("monthlyRent") || "",
          deposit: fd.get("deposit") || "",
          vacantRooms: fd.get("vacantRooms") || "",
          vacantBeds: fd.get("vacantBeds") || "",
          occupiedRooms: fd.get("occupiedRooms") || "",
          occupiedBeds: fd.get("occupiedBeds") || "",
          electricityCharges: fd.get("electricityCharges") || "",
          foodCharges: fd.get("foodCharges") || "",
          maintenanceCharges: fd.get("maintenanceCharges") || "",
          minStay: fd.get("minStay") || "",
          entryExit: fd.get("entryExit") || "",
          bankAccountHolderName: fd.get("bankAccountHolderName") || "",
          bankAccountNumber: fd.get("bankAccountNumber") || "",
          bankIfscCode: fd.get("bankIfscCode") || "",
          bankName: fd.get("bankName") || "",
          bankBranchName: fd.get("bankBranchName") || "",
          bankUpiId: fd.get("bankUpiId") || "",
        };
      }
      setFormSnapshot(prev => ({ ...prev, ...patch }));
    }
    setStep(s => s + 1);
  };

  const submitVisit = async () => {
    const fd = new FormData(formRef.current);
    const visitIdValue = fd.get("visitId") || visitId || `v_${Date.now()}`;
    const visitDate = new Date().toLocaleString();
    const capturedPhotos = Object.values(captureGroups || {}).flat();
    const payload = {
      _id: visitIdValue,
      visitId: visitIdValue,
      submittedAt: new Date().toISOString(),
      staffName,
      staffId,
      propertyName: fd.get("name"),
      propertyType: fd.get("propertyType"),
      propertyId: fd.get("propertyId"),
      verifiedByCompany: fd.get("verifiedByCompany") || "true",
      locationCode: fd.get("locationCode") || locationCode,
      address: fd.get("address"),
      area: fd.get("area"),
      areaLocality: fd.get("areaLocality"),
      city: fd.get("city"),
      landmark: fd.get("landmark"),
      nearbyLocation: fd.get("nearbyLocation"),
      ownerName: fd.get("ownerName"),
      ownerEmail: fd.get("ownerEmail"),
      contactPhone: fd.get("contactPhone"),
      gender: fd.get("gender"),
      monthlyRent: Number(fd.get("monthlyRent") || 0),
      deposit: Number(fd.get("deposit") || 0),
      electricityCharges: Number(fd.get("electricityCharges") || 0),
      foodCharges: Number(fd.get("foodCharges") || 0),
      maintenanceCharges: Number(fd.get("maintenanceCharges") || 0),
      minStay: Number(fd.get("minStay") || 0),
      entryExit: fd.get("entryExit"),
      amenities: fd.getAll("amenities"),
      cleanlinessRating: Number(fd.get("cleanlinessRating") || cleanlinessRating || 0),
      ownerBehaviourPublic: fd.get("ownerBehaviourPublic") || ownerBehaviourPublic,
      studentReviewsRating: Number(fd.get("studentReviewsRating") || studentReviewsRating || 0),
      employeeRating: Number(fd.get("employeeRating") || employeeRating || 0),
      visitorsAllowed: fd.get("visitorsAllowed") || visitorsAllowed,
      cookingAllowed: fd.get("cookingAllowed") || cookingAllowed,
      smokingAllowed: fd.get("smokingAllowed") || smokingAllowed,
      petsAllowed: fd.get("petsAllowed") || petsAllowed,
      bankAccountHolderName: fd.get("bankAccountHolderName"),
      bankAccountNumber: fd.get("bankAccountNumber"),
      bankIfscCode: fd.get("bankIfscCode"),
      bankName: fd.get("bankName"),
      bankBranchName: fd.get("bankBranchName"),
      bankUpiId: fd.get("bankUpiId"),
      internalRemarks: fd.get("internalRemarks"),
      studentReviews: fd.get("studentReviews"),
      cleanlinessNote: fd.get("cleanlinessNote"),
      ownerBehaviour: fd.get("ownerBehaviour"),
      latitude: geo.lat || fd.get("latitude"),
      longitude: geo.lng || fd.get("longitude"),
      photos: capturedPhotos.length ? capturedPhotos : fieldPhotos,
      professionalPhotos: profPhotos,
      status: "submitted",
      visitDateDisplay: visitDate
    };

    try {
      if (editingVisit?.visitId || editingVisit?._id) {
        await fetchJson(`/api/visits/${encodeURIComponent(editingVisit.visitId || editingVisit._id)}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await fetchJson("/api/visits", { method: "POST", body: JSON.stringify(payload) });
        
        // Auto-create owner request
        if (fd.get("createOwnerRequest") === "true") {
          try {
            const genId = "ROOMHY" + Math.floor(1000 + Math.random() * 9000);
            await fetchJson("/api/owners", {
              method: "POST",
              headers: getAuthHeader(),
              body: JSON.stringify({
                loginId: genId,
                name: payload.ownerName,
                email: payload.ownerEmail,
                phone: payload.contactPhone,
                locationCode: payload.locationCode,
                credentials: { password: Math.random().toString(36).slice(-8).toUpperCase(), firstTime: true }
              })
            });
          } catch (err) {
            console.error("Failed to auto-create owner request:", err);
          }
        }
      }
      setShowModal(false);
      setEditingVisit(null);
      await loadVisits();
      setSubmitSuccessMsg(editingVisit ? "Visit report updated successfully." : "Visit report submitted successfully.");
    } catch (err) {
      window.alert(err?.body || err?.message || `Failed to ${editingVisit ? "update" : "submit"} visit`);
    }
  };

  const viewMap = (visit) => {
    if (!visit?.latitude || !visit?.longitude) {
      window.alert("No geo coordinates available for this visit.");
      return;
    }
    const url = `https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`;
    window.open(url, "_blank");
  };

  const [search, setSearch] = useState("");
  const [addedVisitIds, setAddedVisitIds] = useState(new Set());
  const [showAddProp, setShowAddProp] = useState(false);
  const [addPropVisit, setAddPropVisit] = useState(null);

  const openAddProperty = async (visit) => {
    const targetId = visit.visitId || visit._id;
    if (!targetId) return;

    if (!window.confirm(`Send owner onboarding request for "${visit.propertyName || visit.propertyInfo?.name}" to Superadmin?`)) return;
    try {
      if (addedVisitIds.has(targetId)) {
        window.alert("Request already sent to Superadmin!");
        return;
      }
      
      const onboardingReq = {
        enquiryId: visit.visitId || visit._id || `enq_${Date.now()}`,
        type: "property_from_visit",
        submittedAt: new Date().toISOString(),
        propertyName: visit.propertyName || visit.propertyInfo?.name,
        propertyType: visit.propertyType || visit.propertyInfo?.propertyType,
        address: visit.address || visit.propertyInfo?.address,
        city: visit.city || visit.propertyInfo?.city,
        area: visit.area || visit.propertyInfo?.area,
        ownerName: visit.ownerName || visit.propertyInfo?.ownerName,
        ownerEmail: visit.ownerEmail || visit.propertyInfo?.ownerEmail,
        ownerPhone: visit.contactPhone || visit.ownerPhone || visit.propertyInfo?.contactPhone,
        monthlyRent: visit.monthlyRent || visit.propertyInfo?.monthlyRent || visit.rent,
        roomCount: (visit.vacantRooms || 0) + (visit.occupiedRooms || 0),
        bedCount: (visit.vacantBeds || 0) + (visit.occupiedBeds || 0),
        pendingCredentials: {
          loginId: "OWN" + Math.floor(1000 + Math.random() * 9000),
          password: Math.random().toString(36).slice(-8).toUpperCase()
        }
      };

      // POST to backend API
      await fetchJson("/api/property-enquiries", {
        method: "POST",
        body: JSON.stringify(onboardingReq)
      });

      let existingEnquiries = [];
      try {
        existingEnquiries = JSON.parse(localStorage.getItem("roomhy_property_enquiries") || "[]");
        if (!Array.isArray(existingEnquiries)) existingEnquiries = [];
      } catch (_) {}
      existingEnquiries.push(onboardingReq);
      localStorage.setItem("roomhy_property_enquiries", JSON.stringify(existingEnquiries));
      setAddedVisitIds(prev => new Set([...prev, targetId]));
      window.alert("Property Onboarding request sent to Superadmin successfully!");
    } catch (err) {
      console.error(err);
      window.alert("Failed to send request: " + (err.message || ""));
    }
  };
  const filteredVisits = useMemo(() => {
    const q = search.toLowerCase();
    return visits.filter(v => {
      const propName = (v.propertyName || v.propertyInfo?.name || "").toLowerCase();
      const staffName = (v.staffName || v.submittedBy || "").toLowerCase();
      return propName.includes(q) || staffName.includes(q);
    });
  }, [visits, search]);

  const stats = useMemo(() => {
    const total = visits.length;
    const approved = visits.filter(v => v.status === "approved").length;
    const photosCount = visits.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);
    return { total, approved, pending: total - approved, photosCount };
  }, [visits]);

  return (
    <>
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Visit Reports</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Submit new property visits for approval</p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={openModal} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add New Visit
            </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 bg-blue-50 text-blue-600 border-blue-100">
             <ClipboardCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">Total Visits</p>
             <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 bg-indigo-50 text-indigo-600 border-indigo-100">
             <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">Average Time</p>
             <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">24m</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 bg-emerald-50 text-emerald-600 border-emerald-100">
             <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">Approved</p>
             <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 bg-amber-50 text-amber-600 border-amber-100">
             <Camera className="w-5 h-5" />
          </div>
          <div className="min-w-0">
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">Photos Uploaded</p>
             <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{stats.photosCount}</p>
          </div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">All Visit Reports</h3>
            <div className="flex items-center gap-3">
              <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search visits..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                  />
              </div>
              <button onClick={loadVisits} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                    <th className="pb-4">Visit ID</th>
                    <th className="pb-4">Property Details</th>
                    <th className="pb-4 text-center">Staff Details</th>
                    <th className="pb-4 text-center">Cleanliness</th>
                    <th className="pb-4 text-center">Photos</th>
                    <th className="pb-4 text-center">Status</th>
                    <th className="pb-4 text-center">Add Prop</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="8" className="py-20 text-center">
                      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Loading Visit Reports...</p>
                    </td></tr>
                  ) : filteredVisits.length === 0 ? (
                    <tr><td colSpan="8" className="py-12 text-center text-[10px] font-bold text-slate-400 uppercase">No visits found.</td></tr>
                  ) : filteredVisits.map((v, i) => {
                    const alreadyAdded = addedVisitIds?.has ? addedVisitIds.has(v.visitId || v._id) : false;
                    return (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="py-3">
                          <p className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shadow-sm inline-block">#{String(v._id || "").substring(0, 6) || "ERR"}</p>
                          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60 leading-none">{new Date(v.submittedAt || Date.now()).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-none truncate max-w-[150px]">{v.propertyName || v.propertyInfo?.name || "Unknown Property"}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-60 leading-none truncate">
                                    {v.propertyType || v.propertyInfo?.propertyType || "Property"} • {v.area || v.propertyInfo?.area || "Area"}
                                </p>
                              </div>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <p className="text-[10px] font-bold text-slate-700 leading-none">{v.staffName || v.submittedBy || "System Admin"}</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60 leading-none">ID: {v.staffId || v.submittedById || "ADMIN"}</p>
                        </td>
                        <td className="py-3 text-center">
                          <div className="inline-flex flex-col items-center bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg shadow-sm">
                              <div className="flex text-amber-400 text-[8px] gap-0.5">
                                {[...Array(5)].map((_, idx) => (
                                    <Star key={idx} className={`w-2 h-2 ${idx < (v.cleanlinessRating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />
                                ))}
                              </div>
                              <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">{v.cleanlinessRating || 0}/5 Rating</p>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center -space-x-2.5">
                              {(v.photos || []).slice(0, 2).map((img, idx) => (
                                <div key={idx} className="w-8 h-8 rounded-xl border-2 border-white bg-slate-100 overflow-hidden shadow-sm transition-transform group-hover:scale-105 hover:z-20 relative">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </div>
                              ))}
                              {(v.photos || []).length > 2 && (
                                <div className="w-8 h-8 rounded-xl border-2 border-white bg-slate-800 text-white flex items-center justify-center text-[8px] font-bold shadow-sm z-10 transition-transform group-hover:scale-105">
                                    +{(v.photos || []).length - 2}
                                  </div>
                              )}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm ${
                              v.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                              {v.status || "Submitted"}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {alreadyAdded ? (
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg whitespace-nowrap shadow-sm">
                              ✓ Added
                            </span>
                          ) : (
                            <button
                              onClick={() => openAddProperty(v)}
                              className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded-lg transition shadow-sm whitespace-nowrap"
                            >
                              + Prop
                            </button>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => viewMap(v)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><Map className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteVisit(v)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"><Trash className="w-3.5 h-3.5" /></button>
                              <button onClick={() => openEditModal(v)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"><Edit3 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                    </tr>
                  )})}
              </tbody>
            </table>
        </div>
      </div>
    </div>

      {showModal && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-2xl shadow-pop rounded-2xl max-h-[90vh] flex flex-col overflow-hidden border border-border">

            {/* Gradient accent strip */}
            <div className="h-[3px] bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 flex-shrink-0 rounded-t-2xl" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none mb-0.5">{editingVisit ? "Edit Property Visit" : "New Property Visit"}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">Step {step} of 5 &mdash; {["Basic Details","Property Details","Gallery","Live Capture","Review & Submit"][step-1]}</p>
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center px-6 py-3.5 border-b border-border flex-shrink-0 bg-muted/30">
              {[
                { n: 1, label: "Basics" },
                { n: 2, label: "Property" },
                { n: 3, label: "Gallery" },
                { n: 4, label: "Capture" },
                { n: 5, label: "Review" }
              ].map((s, idx) => (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${step > s.n ? 'bg-emerald-500 text-white shadow-sm' : step === s.n ? 'bg-violet-600 text-white ring-4 ring-violet-100' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {step > s.n ? '✓' : s.n}
                    </div>
                    <span className={`text-[9px] font-bold tracking-wide uppercase hidden sm:block whitespace-nowrap ${step === s.n ? 'text-violet-700' : step > s.n ? 'text-emerald-600' : 'text-muted-foreground'}`}>{s.label}</span>
                  </div>
                  {idx < 4 && <div className={`flex-1 h-[2px] mx-2 rounded-full transition-all duration-300 ${step > s.n ? 'bg-emerald-400' : 'bg-border'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Form */}
            <form ref={formRef} key={editingVisit?.visitId || editingVisit?._id || "new-visit"} className="flex flex-col flex-1 min-h-0" onSubmit={(e) => e.preventDefault()}>
              <input type="hidden" name="visitId" value={visitId} />
              <input type="hidden" name="latitude" value={geo.lat} />
              <input type="hidden" name="longitude" value={geo.lng} />
              <input type="hidden" name="verifiedByCompany" value="true" />
              <input type="hidden" name="locationCode" value={locationCode} />
              <input type="hidden" name="area" value={areaName} />
              <input type="hidden" name="city" value={modalCityName || resolvedCityName} />

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Step 1: Basic Details */}
                {step === 1 && (
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                      <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Basic Details</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Auto-generated visit info and property classification</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Visit Date & Time</label>
                        <input type="text" readOnly className="w-full border border-border bg-muted/50 text-muted-foreground rounded-xl px-3 py-2.5 text-[13px] cursor-not-allowed" value={visitDateDisplay} />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Staff Name</label>
                        <input type="text" name="staffName" readOnly className="w-full border border-border bg-muted/50 text-muted-foreground rounded-xl px-3 py-2.5 text-[13px] cursor-not-allowed" value={staffName} />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Staff ID</label>
                        <input type="text" name="staffId" readOnly className="w-full border border-border bg-muted/50 text-muted-foreground rounded-xl px-3 py-2.5 text-[13px] cursor-not-allowed" value={staffId} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Property ID</label>
                        <div className="relative">
                          <input name="propertyId" type="text" readOnly className="w-full border border-border bg-muted/50 text-muted-foreground rounded-xl px-3 py-2.5 text-[13px] cursor-not-allowed pr-28" value={propertyId} />
                          <button type="button" onClick={generatePropertyId} disabled={!!editingVisit} className="absolute right-2 top-1/2 -translate-y-1/2 bg-card border border-border text-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-muted transition-all disabled:opacity-40">
                            Regenerate
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Property Type</label>
                        <select name="propertyType" className="w-full border border-input bg-card text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all" defaultValue={editingVisit?.propertyType || "PG"}>
                          <option value="PG">PG</option>
                          <option value="Hostel">Hostel</option>
                          <option value="Room">Room</option>
                          <option value="Flat">Flat</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Property Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    {/* Property Info */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-violet-500 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Property Information</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Property Name *</label>
                          <input name="name" type="text" required defaultValue={editingVisit?.propertyName || ""} className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="e.g. Sunrise PG for Boys" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Full Address *</label>
                          <textarea name="address" rows="2" required defaultValue={editingVisit?.address || ""} className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground resize-none" placeholder="Street, Area, City, Pin Code"></textarea>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Area / Locality</label>
                            <input name="areaLocality" type="text" readOnly className="w-full border border-border bg-muted/50 text-muted-foreground rounded-xl px-3 py-2.5 text-[13px] cursor-not-allowed" value={areaName} />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Landmark</label>
                            <input name="landmark" type="text" defaultValue={editingVisit?.landmark || ""} className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="Nearby landmark" />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Nearby Location</label>
                            <input name="nearbyLocation" type="text" defaultValue={editingVisit?.nearbyLocation || ""} className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="Nearby location" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Gender Preference</label>
                          <select name="gender" className="w-full border border-input bg-card text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all" defaultValue={editingVisit?.gender || ""}>
                            <option value="">Select Gender Preference</option>
                            <option value="Male Only">Male Only</option>
                            <option value="Female Only">Female Only</option>
                            <option value="Co-Ed">Co-Ed</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Owner Information</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Owner Name *</label>
                          <input name="ownerName" type="text" required defaultValue={editingVisit?.ownerName || ""} className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="Full name" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Contact Number *</label>
                          <input name="contactPhone" type="tel" required defaultValue={editingVisit?.contactPhone || editingVisit?.ownerPhone || ""} className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Email Address *</label>
                          <input name="ownerEmail" type="email" required defaultValue={editingVisit?.ownerEmail || ""} className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="owner@gmail.com" />
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Amenities</span>
                      </div>
                      <div className="grid grid-cols-4 gap-y-3 gap-x-3">
                        {["Wi-Fi", "Drinking water", "Food", "Power backup", "Washing machine", "Parking", "CCTV"].map((a) => (
                          <label key={a} className="inline-flex items-center gap-2 text-[11px] text-foreground cursor-pointer group">
                            <input type="checkbox" name="amenities" value={a} className="rounded border-input text-violet-600 focus:ring-violet-500 w-3.5 h-3.5" defaultChecked={editingVisit?.amenities?.some(x => x?.toLowerCase() === a?.toLowerCase())} />
                            <span className="group-hover:text-violet-600 transition-colors">{a}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-amber-500 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Pricing & Occupancy</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {[
                          { name: "monthlyRent", label: "Monthly Rent", placeholder: "₹0", val: editingVisit?.monthlyRent },
                          { name: "deposit", label: "Deposit", placeholder: "₹0", val: editingVisit?.deposit },
                          { name: "vacantRooms", label: "Vacant Rooms", placeholder: "0", val: editingVisit?.vacantRooms },
                          { name: "vacantBeds", label: "Beds (Vacant)", placeholder: "0", val: editingVisit?.vacantBeds }
                        ].map(f => (
                          <div key={f.name}>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">{f.label}</label>
                            <input name={f.name} type="number" min="0" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder={f.placeholder} defaultValue={f.val || ""} />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {[
                          { name: "occupiedRooms", label: "Occupied Rooms", placeholder: "0", val: editingVisit?.occupiedRooms },
                          { name: "occupiedBeds", label: "Beds (Occupied)", placeholder: "0", val: editingVisit?.occupiedBeds },
                          { name: "electricityCharges", label: "Electricity/mo", placeholder: "₹0", val: editingVisit?.electricityCharges },
                          { name: "foodCharges", label: "Food/mo", placeholder: "₹0", val: editingVisit?.foodCharges }
                        ].map(f => (
                          <div key={f.name}>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">{f.label}</label>
                            <input name={f.name} type="number" min="0" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder={f.placeholder} defaultValue={f.val || ""} />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Maintenance/mo</label>
                          <input name="maintenanceCharges" type="number" min="0" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="₹0" defaultValue={editingVisit?.maintenanceCharges || ""} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Min. Stay (months)</label>
                          <input name="minStay" type="number" min="0" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="0" defaultValue={editingVisit?.minStay || ""} />
                        </div>
                      </div>
                    </div>

                    {/* House Rules */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-rose-500 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">House Rules</span>
                      </div>
                      <div className="mb-4">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Entry / Exit Timing</label>
                        <input name="entryExit" type="text" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="e.g. 6 AM – 11 PM" defaultValue={editingVisit?.entryExit || ""} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "visitorsAllowed", label: "Visitors Allowed", value: visitorsAllowed },
                          { id: "cookingAllowed", label: "Cooking Allowed", value: cookingAllowed },
                          { id: "smokingAllowed", label: "Smoking Allowed", value: smokingAllowed },
                          { id: "petsAllowed", label: "Pets Allowed", value: petsAllowed }
                        ].map((item) => (
                          <div key={item.id} className="bg-muted/30 border border-border rounded-xl p-3">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2.5">{item.label}</label>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setToggleValue(item.id, "Yes")} className={`flex-1 py-2 rounded-lg text-[11px] font-bold border-2 transition-all ${item.value === "Yes" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground hover:border-emerald-200"}`}>Yes</button>
                              <button type="button" onClick={() => setToggleValue(item.id, "No")} className={`flex-1 py-2 rounded-lg text-[11px] font-bold border-2 transition-all ${item.value === "No" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-border text-muted-foreground hover:border-rose-200"}`}>No</button>
                            </div>
                            <input type="hidden" name={item.id} value={item.value} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-sky-500 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Bank Details</span>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Account Holder Name</label>
                            <input name="bankAccountHolderName" type="text" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="Full name on account" defaultValue={editingVisit?.bankAccountHolderName || ""} />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Account Number</label>
                            <input name="bankAccountNumber" type="text" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="Bank account number" defaultValue={editingVisit?.bankAccountNumber || ""} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">IFSC Code</label>
                            <input name="bankIfscCode" type="text" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="e.g. SBIN0001234" defaultValue={editingVisit?.bankIfscCode || ""} />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Bank Name</label>
                            <input name="bankName" type="text" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="e.g. State Bank of India" defaultValue={editingVisit?.bankName || ""} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Branch Name</label>
                            <input name="bankBranchName" type="text" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="Branch name" defaultValue={editingVisit?.bankBranchName || ""} />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">UPI ID <span className="font-normal text-muted-foreground/60">(optional)</span></label>
                            <input name="bankUpiId" type="text" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground" placeholder="e.g. name@upi" defaultValue={editingVisit?.bankUpiId || ""} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Gallery */}
                {step === 3 && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                    <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Images className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Professional Gallery</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Upload high-quality photos from your device (up to 10)</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <button type="button" onClick={openProfModal} className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-[13px] hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" /> Select Photos from Gallery
                      </button>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 min-h-24">
                        {profPhotos.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {profPhotos.map((p, i) => (
                              <div key={`prof-${i}`} className="relative">
                                <img src={p} className="w-16 h-16 object-cover rounded-xl border border-blue-100 shadow-sm" />
                                <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">{i + 1}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-16 gap-1.5">
                            <ImageOff className="w-6 h-6 text-muted-foreground/50" />
                            <p className="text-[11px] text-muted-foreground">No professional photos selected yet</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{profPhotos.length}/10 photos selected</span>
                        {profPhotos.length > 0 && <span className="text-[10px] text-blue-600 font-bold">{profPhotos.length} photo{profPhotos.length > 1 ? 's' : ''} ready</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Live Capture */}
                {step === 4 && (() => {
                  const images = captureGroups.photo_building || [];
                  const last = images[images.length - 1];
                  return (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-violet-900 uppercase tracking-widest">Live Camera Capture</h4>
                            <p className="text-[10px] text-violet-600 mt-0.5">Capture live property photos using your device camera (up to 5)</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 flex-shrink-0">
                              <Camera className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-bold text-foreground">Live Property Photos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{images.length}/5</span>
                            <button type="button" onClick={() => openCamera("photo_building")} className="text-[11px] px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg border border-violet-100 font-bold hover:bg-violet-100 transition-all flex items-center gap-1.5">
                              <Camera className="w-3 h-3" /> Capture
                            </button>
                          </div>
                        </div>
                        <div className="w-full h-40 bg-muted/50 rounded-xl border border-border flex items-center justify-center mb-3 overflow-hidden">
                          {last ? <img src={last} className="w-full h-full object-cover rounded-xl" /> : (
                            <div className="flex flex-col items-center gap-1.5">
                              <CameraOff className="w-6 h-6 text-muted-foreground/40" />
                              <span className="text-[10px] text-muted-foreground/60">No photo captured yet</span>
                              <span className="text-[9px] text-muted-foreground/40">Click Capture to start</span>
                            </div>
                          )}
                        </div>
                        {images.length > 0 && (
                          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
                            {images.map((src, idx) => (
                              <img key={`live-${idx}`} src={src} className="w-12 h-12 object-cover rounded-lg border border-violet-100 flex-shrink-0 shadow-sm" />
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">{images.length}/5 photos captured</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 5: Review & Submit */}
                {step === 5 && (
                  <div className="space-y-4">

                    {/* Full form review summary */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                      <div className="px-5 py-3.5 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-border flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-violet-600" />
                        <h4 className="text-[11px] font-bold text-violet-900 uppercase tracking-widest">Review Your Submission</h4>
                        <span className="ml-auto text-[10px] text-violet-500 font-medium">Check for any wrong inputs</span>
                      </div>
                      <div className="p-5 space-y-4 text-[11px]">

                        {/* Basic Details */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-3 bg-violet-500 rounded-full" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Basic Details</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 bg-muted/30 rounded-xl p-3">
                            <div><span className="text-muted-foreground">Visit Date: </span><span className="font-semibold">{visitDateDisplay || "—"}</span></div>
                            <div><span className="text-muted-foreground">Staff: </span><span className="font-semibold">{staffName || "—"}</span></div>
                            <div><span className="text-muted-foreground">Staff ID: </span><span className="font-semibold">{staffId || "—"}</span></div>
                            <div><span className="text-muted-foreground">Property ID: </span><span className="font-semibold">{propertyId || "—"}</span></div>
                            <div><span className="text-muted-foreground">Type: </span><span className="font-semibold">{formSnapshot.propertyType || "—"}</span></div>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-3 bg-blue-500 rounded-full" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Property Info</span>
                          </div>
                          <div className="space-y-1.5 bg-muted/30 rounded-xl p-3">
                            <div><span className="text-muted-foreground">Name: </span><span className="font-semibold">{formSnapshot.name || "—"}</span></div>
                            <div><span className="text-muted-foreground">Address: </span><span className="font-semibold">{formSnapshot.address || "—"}</span></div>
                            <div className="grid grid-cols-2 gap-x-4">
                              <div><span className="text-muted-foreground">Landmark: </span><span className="font-semibold">{formSnapshot.landmark || "—"}</span></div>
                              <div><span className="text-muted-foreground">Nearby: </span><span className="font-semibold">{formSnapshot.nearbyLocation || "—"}</span></div>
                            </div>
                            <div><span className="text-muted-foreground">Gender Preference: </span><span className="font-semibold">{formSnapshot.gender || "—"}</span></div>
                          </div>
                        </div>

                        {/* Owner Info */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Owner Info</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 bg-muted/30 rounded-xl p-3">
                            <div className="col-span-2"><span className="text-muted-foreground">Name: </span><span className="font-semibold">{formSnapshot.ownerName || "—"}</span></div>
                            <div><span className="text-muted-foreground">Phone: </span><span className="font-semibold">{formSnapshot.contactPhone || "—"}</span></div>
                            <div><span className="text-muted-foreground">Email: </span><span className="font-semibold">{formSnapshot.ownerEmail || "—"}</span></div>
                          </div>
                        </div>

                        {/* Pricing & Occupancy */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-3 bg-amber-500 rounded-full" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Pricing & Occupancy</span>
                          </div>
                          <div className="grid grid-cols-3 gap-y-1.5 gap-x-3 bg-muted/30 rounded-xl p-3">
                            <div><span className="text-muted-foreground">Rent: </span><span className="font-semibold">{formSnapshot.monthlyRent ? `₹${formSnapshot.monthlyRent}` : "—"}</span></div>
                            <div><span className="text-muted-foreground">Deposit: </span><span className="font-semibold">{formSnapshot.deposit ? `₹${formSnapshot.deposit}` : "—"}</span></div>
                            <div><span className="text-muted-foreground">Min Stay: </span><span className="font-semibold">{formSnapshot.minStay ? `${formSnapshot.minStay}m` : "—"}</span></div>
                            <div><span className="text-muted-foreground">Vacant Rooms: </span><span className="font-semibold">{formSnapshot.vacantRooms || "—"}</span></div>
                            <div><span className="text-muted-foreground">Vacant Beds: </span><span className="font-semibold">{formSnapshot.vacantBeds || "—"}</span></div>
                            <div><span className="text-muted-foreground">Electricity: </span><span className="font-semibold">{formSnapshot.electricityCharges ? `₹${formSnapshot.electricityCharges}` : "—"}</span></div>
                          </div>
                        </div>

                        {/* House Rules */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-3 bg-rose-500 rounded-full" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">House Rules</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 bg-muted/30 rounded-xl p-3">
                            <div><span className="text-muted-foreground">Visitors: </span><span className={`font-semibold ${visitorsAllowed === "Yes" ? "text-emerald-600" : "text-rose-600"}`}>{visitorsAllowed}</span></div>
                            <div><span className="text-muted-foreground">Cooking: </span><span className={`font-semibold ${cookingAllowed === "Yes" ? "text-emerald-600" : "text-rose-600"}`}>{cookingAllowed}</span></div>
                            <div><span className="text-muted-foreground">Smoking: </span><span className={`font-semibold ${smokingAllowed === "Yes" ? "text-rose-600" : "text-emerald-600"}`}>{smokingAllowed}</span></div>
                            <div><span className="text-muted-foreground">Pets: </span><span className={`font-semibold ${petsAllowed === "Yes" ? "text-emerald-600" : "text-rose-600"}`}>{petsAllowed}</span></div>
                            {formSnapshot.entryExit && <div className="col-span-2"><span className="text-muted-foreground">Entry/Exit: </span><span className="font-semibold">{formSnapshot.entryExit}</span></div>}
                          </div>
                        </div>

                        {/* Amenities */}
                        {(formSnapshot.amenities || []).length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-3 bg-teal-500 rounded-full" />
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Amenities ({formSnapshot.amenities.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 bg-muted/30 rounded-xl p-3">
                              {formSnapshot.amenities.map((a, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg font-medium">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bank Details */}
                        {formSnapshot.bankAccountNumber && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-3 bg-sky-500 rounded-full" />
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Bank Details</span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 bg-muted/30 rounded-xl p-3">
                              <div className="col-span-2"><span className="text-muted-foreground">Account Holder: </span><span className="font-semibold">{formSnapshot.bankAccountHolderName || "—"}</span></div>
                              <div><span className="text-muted-foreground">Account No: </span><span className="font-semibold">{"****" + formSnapshot.bankAccountNumber.slice(-4)}</span></div>
                              <div><span className="text-muted-foreground">IFSC: </span><span className="font-semibold">{formSnapshot.bankIfscCode || "—"}</span></div>
                              <div><span className="text-muted-foreground">Bank: </span><span className="font-semibold">{formSnapshot.bankName || "—"}</span></div>
                              {formSnapshot.bankUpiId && <div><span className="text-muted-foreground">UPI: </span><span className="font-semibold">{formSnapshot.bankUpiId}</span></div>}
                            </div>
                          </div>
                        )}

                        {/* Photos */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Photos</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                              <span className="text-xl font-bold text-blue-700">{profPhotos.length}</span>
                              <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Gallery Photos</p>
                            </div>
                            <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
                              <span className="text-xl font-bold text-violet-700">{(captureGroups.photo_building || []).length}</span>
                              <p className="text-[9px] text-violet-600 font-bold uppercase tracking-widest mt-0.5">Live Captures</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Staff Assessment (simplified) */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0">
                          <Star className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Staff Assessment</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Rate the property for internal reporting</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Cleanliness Rating</label>
                          {renderStars(cleanlinessRating, "cleanlinessRating")}
                          <input type="hidden" name="cleanlinessRating" value={cleanlinessRating} />
                          <p className="text-[10px] text-muted-foreground mt-1.5">{cleanlinessRating ? `${cleanlinessRating}/5 stars` : "Click stars to rate"}</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Owner Behaviour</label>
                          <div className="flex gap-1.5 flex-wrap">
                            {["Good", "Average", "Poor"].map((val) => (
                              <button key={val} type="button" onClick={() => setOwnerBehaviour(val)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all ${ownerBehaviourPublic === val ? val === "Good" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : val === "Average" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-rose-500 bg-rose-50 text-rose-700" : "border-border text-muted-foreground hover:bg-muted"}`}>{val}</button>
                            ))}
                          </div>
                          <input type="hidden" name="ownerBehaviourPublic" value={ownerBehaviourPublic} />
                          <p className="text-[10px] text-muted-foreground mt-1.5">{ownerBehaviourPublic ? `Selected: ${ownerBehaviourPublic}` : "Select behaviour"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-slate-400 rounded-full flex-shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Internal Notes</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Student Reviews Feedback</label>
                          <textarea name="studentReviews" rows="2" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground resize-none" placeholder="Summarize student feedback..." defaultValue={editingVisit?.studentReviews || ""}></textarea>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Internal Remarks (Private)</label>
                          <textarea name="internalRemarks" rows="2" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground resize-none" placeholder="Internal notes for the team..." defaultValue={editingVisit?.internalRemarks || ""}></textarea>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Cleanliness Note (Private)</label>
                          <textarea name="cleanlinessNote" rows="2" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground resize-none" placeholder="Cleanliness observations..." defaultValue={editingVisit?.cleanlinessNote || ""}></textarea>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Owner Behaviour Note (Private)</label>
                          <textarea name="ownerBehaviour" rows="2" className="w-full border border-input bg-background text-foreground rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all placeholder:text-muted-foreground resize-none" placeholder="Behaviour observations..." defaultValue={editingVisit?.ownerBehaviour || ""}></textarea>
                        </div>
                      </div>
                    </div>

                    {!editingVisit && (
                      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <UserPlus className="w-4 h-4" />
                          </div>
                          <h4 className="text-[11px] font-bold text-violet-900 uppercase tracking-widest">Owner Onboarding</h4>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer p-3 bg-white/60 rounded-xl border border-violet-100 hover:bg-white/80 transition-all">
                          <input type="checkbox" name="createOwnerRequest" value="true" className="mt-0.5 w-4 h-4 text-violet-600 rounded border-input focus:ring-violet-500 flex-shrink-0" />
                          <div>
                            <span className="text-[12px] font-semibold text-foreground block leading-snug">Send Owner Onboarding Request to Superadmin</span>
                            <span className="text-[10px] text-muted-foreground mt-1 block leading-relaxed">Automatically creates a pending request for Digital KYC and login credentials once approved.</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20 flex-shrink-0">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border-2 border-border text-[12px] font-bold text-foreground hover:bg-muted transition-all">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                ) : <div />}
                {step < 5 ? (
                  <button type="button" onClick={handleContinue} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-violet-600 text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-violet-700 active:scale-[0.98] transition-all shadow-sm">
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button type="button" onClick={() => submitVisit()} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-violet-600 text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-violet-700 active:scale-[0.98] transition-all shadow-sm">
                    <Send className="w-3.5 h-3.5" /> {editingVisit ? "Update Report" : "Submit Report"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[65] p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg shadow-pop border border-border overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Images className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Professional Photos</h3>
                  <p className="text-[10px] text-muted-foreground">{profPreview.length}/10 selected</p>
                </div>
              </div>
              <button onClick={closeProfModal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="border-2 border-dashed border-border rounded-2xl p-3 min-h-24">
                {profPreview.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-20 gap-2">
                    <ImagePlus className="w-6 h-6 text-muted-foreground/50" />
                    <p className="text-[11px] text-muted-foreground">No photos selected yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {profPreview.map((src, i) => (
                      <div key={`preview-${i}`} className="relative group rounded-xl overflow-hidden aspect-square">
                        <img src={src} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all rounded-xl" />
                        <button type="button" onClick={() => removeProfPhoto(i)} className="absolute top-1 right-1 bg-white text-rose-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-bold text-[12px] hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <UploadCloud className="w-4 h-4" /> Choose Photos from Device
                <input type="file" accept="image/*" multiple onChange={(e) => handleProfInput(e.target.files)} className="hidden" />
              </label>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={closeProfModal} className="px-4 py-2 rounded-xl border border-border text-[12px] font-bold text-foreground hover:bg-muted transition-all">Cancel</button>
                <button type="button" onClick={saveProfPhotos} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-all shadow-sm">Save Photos</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {submitSuccessMsg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[90] p-4">
          <div className="bg-card rounded-2xl shadow-pop border border-border max-w-sm w-full p-8 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Report Submitted!</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{submitSuccessMsg}</p>
            <button type="button" onClick={() => setSubmitSuccessMsg("")} className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-all shadow-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 bg-black z-[80]">
          <div className="w-full h-full flex flex-col">

            {/* Capture View */}
            <div className={cameraView === "capture" ? "h-full flex flex-col relative" : "hidden"}>
              {/* Top HUD */}
              <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-5 pt-5 pb-3 bg-gradient-to-b from-black/70 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-white text-[11px] font-bold uppercase tracking-widest">Live Capture</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={toggleCamera} className="w-8 h-8 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/25 transition-all">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={closeCamera} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/25 transition-all text-[11px] font-bold">
                    <X className="w-3.5 h-3.5" /> Close
                  </button>
                </div>
              </div>

              {/* Video */}
              <div className="flex-1 relative overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}></video>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                {cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center text-white">
                      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-[12px] font-semibold tracking-wide">Initializing Camera...</p>
                    </div>
                  </div>
                )}
                {/* Frame guides */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-52 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br-lg"></div>
                  </div>
                </div>
              </div>

              {cameraError && <div className="px-4 py-2 bg-rose-900/80 text-rose-200 text-[11px] font-medium text-center">{cameraError}</div>}
              {cameraLocation && !cameraError && (
                <div className="px-5 py-2 bg-black/70 text-slate-300 text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{cameraLocation}</span>
                </div>
              )}

              {/* Capture Button */}
              <div className="pb-10 px-6 pt-5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                <button type="button" onClick={capturePhoto} className="w-18 h-18 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all" style={{ width: 72, height: 72 }}>
                  <div className="w-full h-full rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white shadow-lg"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Preview View */}
            <div className={cameraView === "preview" ? "h-full flex flex-col relative" : "hidden"}>
              {/* Top HUD */}
              <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-5 pt-5 pb-3 bg-gradient-to-b from-black/70 to-transparent">
                <span className="text-white text-[11px] font-bold uppercase tracking-widest">Photo Preview</span>
                <button type="button" onClick={closeCamera} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/25 transition-all text-[11px] font-bold">
                  <X className="w-3.5 h-3.5" /> Close
                </button>
              </div>

              {/* Preview Image */}
              <div className="flex-1 bg-black overflow-hidden">
                {capturedPreview && <img src={capturedPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>

              {previewLocation && (
                <div className="px-5 py-2 bg-black/70 text-slate-300 text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{previewLocation}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pb-10 px-5 pt-5 bg-gradient-to-t from-black/80 to-transparent grid grid-cols-3 gap-3">
                <button type="button" onClick={deleteCapture} className="flex items-center justify-center gap-1.5 py-3 bg-rose-600 text-white rounded-xl font-bold text-[12px] hover:bg-rose-700 active:scale-[0.97] transition-all shadow-lg">
                  <Trash2 className="w-3.5 h-3.5" /> Discard
                </button>
                <button type="button" onClick={recapturePhoto} className="flex items-center justify-center gap-1.5 py-3 bg-slate-600 text-white rounded-xl font-bold text-[12px] hover:bg-slate-700 active:scale-[0.97] transition-all shadow-lg">
                  <RotateCw className="w-3.5 h-3.5" /> Retake
                </button>
                <button type="button" onClick={confirmCapture} className="flex items-center justify-center gap-1.5 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[12px] hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-lg">
                  <Check className="w-3.5 h-3.5" /> Keep
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}




