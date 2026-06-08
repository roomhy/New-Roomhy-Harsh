import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show on login page
    if (location.pathname !== '/propertyowner/ownerlogin') {
      return;
    }

    // Check if dismissed previously
    if (sessionStorage.getItem('pwa_prompt_dismissed')) {
        return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
      console.log('PWA Prompt event captured and showing banner!');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [location.pathname]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Already installed");
      setShowPrompt(false);
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
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
