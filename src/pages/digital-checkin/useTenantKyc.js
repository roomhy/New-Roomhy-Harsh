import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiBases, getWithFallback, postExpectSuccess, postWithFallback } from "./utils";
import { useAadhaarOcr } from "./useAadhaarOcr";

const TENANT_KYC_STATE_KEY = "roomhy_tenant_kyc_state";

export const useTenantKyc = () => {
  const apiBases = useMemo(() => getApiBases(), []);

  const [loginId, setLoginId]                       = useState("");
  const [aadhaarNumber, setAadhaarNumber]           = useState("");
  const [aadhaarLinkedPhone, setAadhaarLinkedPhone] = useState("");
  const [tenantPhone, setTenantPhone]               = useState(""); // read-only, from DB
  const [otp, setOtp]                               = useState("");
  const [otpMsg, setOtpMsg]                         = useState("");
  const [nextVisible, setNextVisible]               = useState(false);
  const [otpSent, setOtpSent]                       = useState(false);
  const [otpLoading, setOtpLoading]                 = useState(false); // prevents double-submit
  const [uploading, setUploading]                   = useState(false);
  const [uploadedUrls, setUploadedUrls]             = useState({});
  const [fetchingProfile, setFetchingProfile]       = useState(false);
  const [errors, setErrors]                         = useState({});

  const { frontOcr, backOcr, checkImage, resetOcr } = useAadhaarOcr(apiBases, "tenant");

  // Read loginId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("loginId");
    if (id) setLoginId(id);
  }, []);

  // Fetch tenant profile to get phone number (read-only, set by owner)
  useEffect(() => {
    if (!loginId) return;
    const load = async () => {
      setFetchingProfile(true);
      try {
        const data = await getWithFallback(
          `/api/checkin/tenant/profile/${encodeURIComponent(loginId.trim().toUpperCase())}`,
          apiBases
        );
        const phone = data?.tenant?.phone || data?.tenant?.guardianNumber || "";
        if (phone) {
          setTenantPhone(phone);
          setAadhaarLinkedPhone(phone);
        }
      } catch (_) {
        // Non-blocking — phone may be entered manually if fetch fails
      } finally {
        setFetchingProfile(false);
      }
    };
    load();
  }, [loginId, apiBases]);

  const saveKycState = useCallback(
    (extra = {}) => {
      try {
        sessionStorage.setItem(TENANT_KYC_STATE_KEY, JSON.stringify({
          loginId: loginId.trim(),
          aadhaarNumber: aadhaarNumber.trim().replace(/\D/g, ""),
          aadhaarLinkedPhone: aadhaarLinkedPhone.trim(),
          otpSent,
          ...extra
        }));
      } catch (_) {}
    },
    [aadhaarLinkedPhone, aadhaarNumber, loginId, otpSent]
  );

  useEffect(() => {
    try {
      const state = JSON.parse(sessionStorage.getItem(TENANT_KYC_STATE_KEY) || "{}");
      if (!state || typeof state !== "object") return;
      if (!loginId && state.loginId) setLoginId(state.loginId);
      if (state.aadhaarNumber) setAadhaarNumber(state.aadhaarNumber);
      if (state.otpSent) setOtpSent(true);
    } catch (_) {}
  }, [loginId]);

  // Validate all required fields + uploads; returns error map (empty = valid)
  const validate = useCallback(
    (aadhaarFront, aadhaarBack) => {
      const errs = {};
      const aadhaarRaw = aadhaarNumber.trim().replace(/\D/g, "");
      if (!aadhaarRaw) {
        errs.aadhaarNumber = "Aadhaar number is required";
      } else if (!/^\d{12}$/.test(aadhaarRaw)) {
        errs.aadhaarNumber = "Aadhaar number must be exactly 12 digits";
      } else if (!/^[2-9]/.test(aadhaarRaw)) {
        errs.aadhaarNumber = "Invalid Aadhaar number (must start with 2–9)";
      }
      if (!aadhaarLinkedPhone.trim()) {
        errs.aadhaarLinkedPhone = "Mobile number is required — please contact your owner if missing";
      }
      if (!aadhaarFront) {
        errs.aadhaarFront = "Please upload the front side of your Aadhaar card";
      }
      if (!aadhaarBack) {
        errs.aadhaarBack = "Please upload the back side of your Aadhaar card";
      }
      // OCR mismatch — only block if OCR actually read a number and it doesn't match
      if (
        frontOcr.status === "verified" &&
        frontOcr.aadhaarNumber &&
        aadhaarRaw &&
        frontOcr.aadhaarNumber !== aadhaarRaw
      ) {
        errs.aadhaarNumber = `Number doesn't match image (image shows ${frontOcr.aadhaarNumber.slice(0,4)} **** ${frontOcr.aadhaarNumber.slice(-4)})`;
      }
      return errs;
    },
    [aadhaarLinkedPhone, aadhaarNumber, frontOcr]
  );

  // Called when an image is selected — runs OCR; auto-fills Aadhaar number if empty
  const handleImageOcr = useCallback(
    async (fileOrBase64, side) => {
      if (!fileOrBase64) { resetOcr(side); return; }
      setErrors((prev) => ({ ...prev, [side === "front" ? "aadhaarFront" : "aadhaarBack"]: "" }));
      const extractedNum = await checkImage(fileOrBase64, side);
      if (extractedNum && side === "front" && !aadhaarNumber.trim().replace(/\D/g, "")) {
        setAadhaarNumber(extractedNum);
      }
    },
    [aadhaarNumber, checkImage, resetOcr]
  );

  // Uploads all provided images to Cloudinary via tenant/documents endpoint
  const uploadDocuments = useCallback(
    async (aadhaarFront, aadhaarBack, tenantPhoto) => {
      const hasAny = aadhaarFront || aadhaarBack || tenantPhoto;
      if (!hasAny || !loginId.trim()) return {};
      setUploading(true);
      try {
        const data = await postWithFallback(
          "/api/checkin/tenant/documents",
          { loginId: loginId.trim(), aadhaarFront, aadhaarBack, tenantPhoto },
          apiBases
        );
        const urls = {
          aadhaarFrontUrl:     data?.aadhaarFrontUrl     || "",
          aadhaarBackUrl:      data?.aadhaarBackUrl      || "",
          tenantPhotoUrl:      data?.tenantPhotoUrl      || "",
          ocrExtractedAadhaar: data?.ocrExtractedAadhaar || ""
        };
        setUploadedUrls(urls);
        return urls;
      } catch (err) {
        console.warn("[useTenantKyc] Document upload failed (non-blocking):", err.message);
        return {};
      } finally {
        setUploading(false);
      }
    },
    [apiBases, loginId]
  );

  const handleStart = useCallback(
    async (aadhaarFront = "", aadhaarBack = "", tenantPhoto = "") => {
      // Validate everything before touching the API
      const errs = validate(aadhaarFront, aadhaarBack);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setOtpLoading(true);
      setOtpMsg("");
      try {
        const aadhaarRaw = aadhaarNumber.trim().replace(/\D/g, "");

        // Upload documents in parallel with OTP request
        const uploadPromise = uploadDocuments(aadhaarFront, aadhaarBack, tenantPhoto);

        const data = await postExpectSuccess(
          "/api/checkin/tenant/kyc/send-otp",
          {
            loginId:            loginId.trim(),
            aadhaarNumber:      aadhaarRaw,
            aadhaarLinkedPhone: aadhaarLinkedPhone.trim()
            // Images are NOT sent here — they go to tenant/documents (Cloudinary) separately
          },
          apiBases
        );

        await uploadPromise;

        setOtpSent(true);
        saveKycState({ otpSent: true });
        setOtpMsg(
          data?.mockOtp
            ? `OTP sent. Sandbox mock OTP: ${data.mockOtp}`
            : `OTP sent to ${aadhaarLinkedPhone.trim()}. Enter it below to complete verification.`
        );
      } catch (err) {
        setOtpMsg(`Failed to send OTP: ${err.message}`);
        setOtpLoading(false); // Re-enable button on failure so tenant can retry
      }
      // On success keep button disabled — tenant must now use the OTP
    },
    [aadhaarLinkedPhone, aadhaarNumber, apiBases, loginId, saveKycState, uploadDocuments, validate]
  );

  const handleComplete = useCallback(
    async (aadhaarFront = "", aadhaarBack = "", tenantPhoto = "") => {
      const aadhaarRaw = aadhaarNumber.trim().replace(/\D/g, "");
      if (!/^\d{12}$/.test(aadhaarRaw)) return setOtpMsg("Aadhaar number must be 12 digits");
      if (!otp.trim()) return setOtpMsg("Please enter the OTP");

      try {
        const payload = {
          loginId:      loginId.trim(),
          aadhaarNumber: aadhaarRaw,
          otp:          otp.trim(),
          aadhaarFront: uploadedUrls.aadhaarFrontUrl || aadhaarFront,
          aadhaarBack:  uploadedUrls.aadhaarBackUrl  || aadhaarBack,
          tenantPhoto:  uploadedUrls.tenantPhotoUrl  || tenantPhoto
        };
        saveKycState({ otpSent: true });
        await postExpectSuccess("/api/checkin/tenant/kyc/verify-otp", payload, apiBases);

        // Update local cache
        try {
          const upperLogin = String(payload.loginId || "").toUpperCase();
          const tenants = JSON.parse(localStorage.getItem("roomhy_tenants") || "[]");
          const idx = tenants.findIndex((t) => String(t.loginId || "").toUpperCase() === upperLogin);
          if (idx > -1) {
            tenants[idx].kycStatus = "verified";
            tenants[idx].kyc = {
              ...(tenants[idx].kyc || {}),
              aadhaarNumber:  payload.aadhaarNumber,
              aadhar:         payload.aadhaarNumber,
              aadhaarFront:   payload.aadhaarFront,
              aadhaarBack:    payload.aadhaarBack,
              otpVerified:    true,
              otpVerifiedAt:  new Date().toISOString()
            };
            if (payload.tenantPhoto) tenants[idx].photo = payload.tenantPhoto;
            localStorage.setItem("roomhy_tenants", JSON.stringify(tenants));
          }
        } catch (_) {}

        setOtpMsg("KYC verification completed successfully!");
        setNextVisible(true);
      } catch (err) {
        setOtpMsg(`Verification failed: ${err.message}`);
      }
    },
    [aadhaarNumber, apiBases, loginId, otp, saveKycState, uploadedUrls]
  );

  const handleNext = useCallback(() => {
    window.location.href = `/digital-checkin/tenantagreement?loginId=${encodeURIComponent(loginId.trim())}`;
  }, [loginId]);

  return {
    loginId, setLoginId,
    aadhaarNumber, setAadhaarNumber,
    aadhaarLinkedPhone,           // read-only, from DB — do NOT expose setter to UI
    tenantPhone,                  // original value from DB
    fetchingProfile,
    otp, setOtp,
    otpMsg, nextVisible, otpSent, otpLoading, uploading,
    frontOcr, backOcr, handleImageOcr,
    errors, setErrors,
    handleStart, handleComplete, handleNext
  };
};
