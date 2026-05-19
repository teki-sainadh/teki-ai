import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronRight, Check, Trash2, User, Palette, Shield } from "lucide-react";

interface SettingsPageProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsView: 'main' | 'appearance' | 'profile' | 'data';
  setSettingsView: (view: 'main' | 'appearance' | 'profile' | 'data') => void;
  theme: 'system' | 'light' | 'dark';
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  user: any;
  isDarkMode: boolean;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleSignOut: () => void;
  deleteAccount: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  isSettingsOpen, 
  setIsSettingsOpen, 
  settingsView, 
  setSettingsView, 
  theme,
  setTheme,
  displayName, 
  setDisplayName, 
  user, 
  isDarkMode,
  showLogoutConfirm, 
  setShowLogoutConfirm, 
  showDeleteConfirm, 
  setShowDeleteConfirm, 
  handleSignOut, 
  deleteAccount
}) => {
  const [tempName, setTempName] = useState(displayName || user?.displayName || 'Guest');
  const [imgError, setImgError] = useState(false);

  const handleSaveProfile = () => {
    setDisplayName(tempName);
    localStorage.setItem('teki_user_name', tempName);
    setSettingsView('main');
  };

  const renderMain = () => (
    <div className="flex-1 overflow-y-auto space-y-0 w-full no-scrollbar pt-4">
      {/* Profile Section */}
      <div className="flex flex-col items-center pt-4 pb-8">
        <div className="relative group mb-4">
          {user?.photoURL && !imgError ? (
            <img 
              src={user.photoURL} 
              alt={displayName} 
              className="w-20 h-20 rounded-full border-2 border-[var(--border)] object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[var(--bg-input)] border-2 border-[var(--border-color)] flex items-center justify-center">
              <span 
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-main)' }}
              >
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        <h3 
          className="text-[17px] font-bold"
          style={{ color: 'var(--text-main)' }}
        >
          {displayName || user?.displayName || 'User'}
        </h3>
        <p 
          className="text-[13px] opacity-70 mt-0.5"
          style={{ color: 'var(--text-main)' }}
        >
          {user?.email}
        </p>
      </div>

      {/* Settings List */}
      <div className="space-y-6">
        <div className="bg-transparent border-t border-b border-[var(--border-color)] overflow-hidden">
          <button 
            onClick={() => {
              setTempName(displayName || user?.displayName || 'Guest');
              setSettingsView('profile');
            }}
            className="w-full h-14 flex items-center px-4 border-b border-[var(--border-color)] last:border-b-0 transition-colors hover:bg-white/[0.03]"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
              <User size={18} className="text-blue-500" />
            </div>
            <span 
              className="text-[15px] font-normal flex-1 text-left"
              style={{ color: 'var(--text-main)' }}
            >
              Your Profile
            </span>
            <ChevronRight size={16} className="text-[var(--text-secondary)]" />
          </button>

          <button 
            onClick={() => setSettingsView('appearance')}
            className="w-full h-14 flex items-center px-4 border-b border-[var(--border-color)] last:border-b-0 transition-colors hover:bg-white/[0.03]"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mr-3">
              <Palette size={18} className="text-orange-500" />
            </div>
            <span 
              className="text-[15px] font-normal flex-1 text-left"
              style={{ color: 'var(--text-main)' }}
            >
              Appearance
            </span>
            <span 
              className="text-[14px] opacity-70 mr-2 capitalize"
              style={{ color: 'var(--text-main)' }}
            >
              {theme}
            </span>
            <ChevronRight size={16} className="text-[var(--text-secondary)]" />
          </button>

          <button 
            onClick={() => setSettingsView('data')}
            className="w-full h-14 flex items-center px-4 last:border-b-0 transition-colors hover:bg-white/[0.03]"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3">
              <Shield size={18} className="text-purple-500" />
            </div>
            <span 
              className="text-[15px] font-normal flex-1 text-left"
              style={{ color: 'var(--text-main)' }}
            >
              Data & Privacy
            </span>
            <ChevronRight size={16} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="bg-transparent border-t border-b border-[var(--border-color)] overflow-hidden">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-14 flex items-center px-4 transition-colors hover:bg-white/[0.03]"
          >
            <span className="text-[15px] font-medium text-red-500 flex-1 text-center">Sign out</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 pb-10 flex flex-col items-center">
        <p className="text-[12px] font-medium text-[var(--text-secondary)]">
          Teki AI · v1.0.0
        </p>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 w-full no-scrollbar">
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 block ml-1" style={{ color: 'var(--text-main)' }}>
            Display Identity
          </label>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[15px] font-light outline-none transition-all focus:border-[var(--text-secondary)] ring-0"
            style={{ color: 'var(--text-main)' }}
            placeholder="Identity name"
          />
        </div>
        <button
          onClick={handleSaveProfile}
          className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-bold text-[14px] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 w-full no-scrollbar">
      <div className="space-y-4">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 block ml-1" style={{ color: 'var(--text-main)' }}>
          Theme Preference
        </label>
        <div className="grid grid-cols-1 gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                theme === t 
                  ? 'border-[var(--text-main)] bg-[var(--bg-input)] shadow-sm' 
                  : 'border-[var(--border-color)] bg-[var(--bg-sidebar)]/50 hover:border-[var(--text-secondary)]'
              }`}
            >
              <span 
                className={`text-[14px] font-light capitalize`}
                style={{ color: 'var(--text-main)' }}
              >
                {t} Mode
              </span>
              {theme === t && <Check size={16} className="text-[var(--text-main)]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderData = () => (
    <div className="flex-1 overflow-y-auto p-6 w-full no-scrollbar">
      <div className="border-t border-b border-[var(--border-color)] bg-transparent p-6 space-y-4">
        <h3 className="text-[14px] font-medium mb-2" style={{ color: 'var(--text-main)' }}>Danger Zone</h3>
        <p className="text-[13px] font-light opacity-70 leading-relaxed" style={{ color: 'var(--text-main)' }}>
          Deleting your identity will remove all stored sessions and preferences permanently.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3.5 border border-[var(--border-color)] text-red-500 hover:text-red-400 hover:bg-[var(--bg-input)] rounded-lg text-[13px] font-medium transition-colors mt-2"
        >
          Delete identity & data
        </button>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg-main)]"
    >
      <div className="flex flex-col h-full mx-auto w-full bg-[var(--bg-main)]">
        {/* Header */}
        <div className="flex items-center justify-between h-[70px] px-6 border-b border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (settingsView === 'main') {
                  setIsSettingsOpen(false);
                } else {
                  setSettingsView('main');
                }
              }}
              className="p-1 transition-colors opacity-70 hover:opacity-100"
              style={{ color: 'var(--text-main)' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-[15px] font-medium tracking-tight" style={{ color: 'var(--text-main)' }}>
              {settingsView === 'main' ? 'App Settings' : settingsView.charAt(0).toUpperCase() + settingsView.slice(1)}
            </h2>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="text-[12px] font-medium opacity-50 hover:opacity-100 transition-colors uppercase tracking-widest"
            style={{ color: 'var(--text-main)' }}
          >
            Close
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={settingsView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {settingsView === 'main' && renderMain()}
            {settingsView === 'profile' && renderProfile()}
            {settingsView === 'appearance' && renderAppearance()}
            {settingsView === 'data' && renderData()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confirmation Overlays */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[var(--bg-main)]/90 backdrop-blur-md"
          >
            <div className="w-full max-w-xs space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-[18px] font-medium text-[var(--text-main)]">Sign out?</h3>
                <p className="text-[13px] font-light text-[var(--text-secondary)]">You will be logged out of your session.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSignOut}
                  className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-bold text-[14px]"
                >
                  Confirm Sign out
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-main)] rounded-xl font-medium text-[13px]"
                >
                  Stay logged in
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[var(--bg-main)]/95 backdrop-blur-xl"
          >
            <div className="w-full max-w-xs space-y-6 text-center">
              <div className="p-4 bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] font-medium text-[var(--text-main)]">Delete everything?</h3>
                <p className="text-[13px] font-light text-[var(--text-secondary)]">This action is permanent. All chats and settings will be erased.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={deleteAccount}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-[14px] transition-colors"
                >
                  Delete Identity
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-medium text-[13px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
