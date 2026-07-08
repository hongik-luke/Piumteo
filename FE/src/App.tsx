import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ToastContainer } from "@/components/feedback/Overlays";
import { INITIAL_PLACES } from "@/mocks/placeData";
import { LoginScreen } from "@/pages/LoginScreen";
import { MapScreen } from "@/pages/MapScreen";
import { RegisterScreen } from "@/pages/RegisterScreen";
import { SignupScreen } from "@/pages/SignupScreen";
import type { MapLatLng } from "@/components/map/NaverMapCanvas";
import type { AuthSession, Place, Screen, ToastItem, ToastType } from "@/types/domain";
import { AUTH_EXPIRED_EVENT } from "@/utils/authEvents";
import {
  clearAuthSession,
  getOrCreateGuestKey,
  getStoredAuthSession,
  getStoredLocationConsent,
  saveAuthSession,
  saveLocationConsent,
} from "@/utils/clientState";
import { uid } from "@/utils/common";

export default function App() {
  const [screen, setScreen] = useState<Screen>("map");
  const [registerCenter, setRegisterCenter] = useState<MapLatLng>({ lat: 37.5512345, lng: 126.9234567 });
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [guestKey] = useState(() => getOrCreateGuestKey());
  const [locationConsent, setLocationConsent] = useState(() => getStoredLocationConsent());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);

  const isLoggedIn = authSession !== null;
  const locationAsked = locationConsent !== "prompt";
  const locationGranted = locationConsent === "granted";

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    function handleAuthExpired() {
      setAuthSession(null);
      setScreen("login");
      addToast("warning", "로그인이 만료되었습니다. 다시 로그인해 주세요.");
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [addToast]);

  function handleLogin(session: AuthSession) {
    setAuthSession(session);
    saveAuthSession(session);
    setScreen("map");
    addToast("success", "로그인되었습니다. 환영합니다.");
  }

  function handleSignup(session?: AuthSession) {
    if (session) {
      setAuthSession(session);
      saveAuthSession(session);
      setScreen("map");
      addToast("success", "회원가입과 로그인이 완료되었습니다.");
      return;
    }

    setScreen("login");
    addToast("success", "회원가입이 완료되었습니다. 로그인해 주세요.");
  }

  function handleLogout() {
    setAuthSession(null);
    clearAuthSession();
    setScreen("map");
    addToast("info", "로그아웃되었습니다. 비회원으로 전환했어요.");
  }

  function handleLocationDecision(granted: boolean) {
    const nextConsent = granted ? "granted" : "denied";
    setLocationConsent(nextConsent);
    saveLocationConsent(nextConsent);
  }

  function handleOpenRegister(center: MapLatLng) {
    setRegisterCenter(center);
    setScreen("register");
  }

  return (
    <div className="flex items-start justify-center min-h-svh bg-slate-400 sm:py-8">
      <div
        className="relative w-full sm:w-[390px] bg-[#E4EBF3] overflow-hidden"
        style={{
          height: "100svh",
          maxHeight: "100svh",
          fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <AnimatePresence mode="wait">
          {screen === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0"
            >
              <MapScreen
                isLoggedIn={isLoggedIn}
                authSession={authSession}
                guestKey={guestKey}
                onNavigate={setScreen}
                addToast={addToast}
                places={places}
                setPlaces={setPlaces}
                locationAsked={locationAsked}
                locationGranted={locationGranted}
                onLocationDecision={handleLocationDecision}
                onLogout={handleLogout}
                onOpenRegister={handleOpenRegister}
              />
            </motion.div>
          )}
          {screen === "login" && (
            <motion.div
              key="login"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="absolute inset-0"
            >
              <LoginScreen onLogin={handleLogin} onNavigate={setScreen} />
            </motion.div>
          )}
          {screen === "signup" && (
            <motion.div
              key="signup"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="absolute inset-0"
            >
              <SignupScreen onSuccess={handleSignup} onNavigate={setScreen} />
            </motion.div>
          )}
          {screen === "register" && (
            <motion.div
              key="register"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 370, damping: 34 }}
              className="absolute inset-0"
            >
              <RegisterScreen
                targetCenter={registerCenter}
                onBack={() => setScreen("map")}
                addToast={addToast}
                onAddPlace={(place) => setPlaces((prev) => [...prev, place])}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
}
