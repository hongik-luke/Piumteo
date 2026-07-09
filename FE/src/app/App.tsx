import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AUTH_EXPIRED_EVENT } from "@/app/authEvents";
import { AppLayout } from "@/app/AppLayout";
import type { Screen } from "@/app/screen";
import { ToastContainer } from "@/components/feedback/Overlays";
import { LoginScreen } from "@/pages/login/LoginPage";
import { MapScreen } from "@/pages/map/MapPage";
import { SignupScreen } from "@/pages/signup/SignupPage";
import type { AuthSession, ToastItem, ToastType } from "@/types/domain";
import {
  clearAuthSession,
  getStoredAuthSession,
  getStoredLocationConsent,
  saveAuthSession,
  saveLocationConsent,
} from "@/utils/storage/clientState";
import { uid } from "@/utils/uid";

export default function App() {
  const [screen, setScreen] = useState<Screen>("map");
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [locationConsent, setLocationConsent] = useState(() => getStoredLocationConsent());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const isLoggedIn = authSession !== null;
  const locationAsked = locationConsent !== "prompt";
  const locationGranted = locationConsent === "granted";

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3800);
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

  return (
    <AppLayout>
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
              onNavigate={setScreen}
              addToast={addToast}
              locationAsked={locationAsked}
              locationGranted={locationGranted}
              onLocationDecision={handleLocationDecision}
              onLogout={handleLogout}
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
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
