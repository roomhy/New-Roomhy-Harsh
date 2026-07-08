import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Clear old buggy localStorage key so users aren't permanently locked out of install prompt
    if (localStorage.getItem('pwa_prompt_shown')) {
      localStorage.removeItem('pwa_prompt_shown');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Expose to other parts of the app so user-gesture handlers can trigger the prompt
      try { window.deferredPwaPrompt = e; } catch (_) {}
      console.log('PWA: beforeinstallprompt event captured and stored.');
    };

    window.addEventListener('beforeinstallprompt', handler);

    const appInstalledHandler = () => {
      console.log('PWA: App installed successfully.');
      localStorage.setItem('pwa_prompt_installed', 'true');
      setDeferredPrompt(null);
      setShowPrompt(false);
    };
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  useEffect(() => {
    if (!deferredPrompt) {
      setShowPrompt(false);
      return;
    }

    // Check if already installed via localStorage
    if (localStorage.getItem('pwa_prompt_installed') === 'true') {
      setShowPrompt(false);
      return;
    }

    // Only show inside propertyowner dashboard (not on login page)
    if (!location.pathname.startsWith('/propertyowner') || location.pathname.includes('login')) {
      setShowPrompt(false);
      return;
    }

    // Check if dismissed previously and if 24 hours have passed
    const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until');
    if (dismissedUntil) {
      const now = Date.now();
      if (now < parseInt(dismissedUntil, 10)) {
        setShowPrompt(false);
        return;
      }
    }

    setShowPrompt(true);
  }, [deferredPrompt, location.pathname]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Already installed or not available");
      setShowPrompt(false);
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      localStorage.setItem('pwa_prompt_installed', 'true');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
      // Hide for 24 hours on dismissal/cancellation
      const hideUntil = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('pwa_prompt_dismissed_until', hideUntil.toString());
      setShowPrompt(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    try { window.deferredPwaPrompt = null; } catch (_) {}
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Hide prompt for 24 hours
    const hideUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa_prompt_dismissed_until', hideUntil.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 z-[9999] flex flex-col gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-gray-900">Install Roomhy App</h3>
            <p className="text-[12px] text-gray-500 mt-0.5 leading-tight">Install for a faster experience and 1-tap access from your home screen.</p>
          </div>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <button 
        onClick={handleInstallClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-[13px]"
      >
        Install Now
      </button>
    </div>
  );
}
