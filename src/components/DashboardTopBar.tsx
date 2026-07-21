"use client";

import { Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string | number;
  title: string;
  message?: string;
  time?: string;
  created_at?: string | Date;
  is_read: boolean;
}

interface DashboardTopBarProps {
  userName?: string;
  userAvatar?: string | null;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

export default function DashboardTopBar({
  userName,
  userAvatar,
  notifications,
  showNotifications,
  setShowNotifications
}: DashboardTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[#0A0A0A] border border-[#E1E0CC]/15/80 rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.01)] relative">
      {/* Back Button */}
      <Link 
        href="/"
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E1E0CC]/60 hover:text-[#E1E0CC] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back</span>
      </Link>
      {/* Notification Bell + Profile Info */}
      <div className="flex items-center gap-4 relative">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-black hover:bg-[#E1E0CC]/10 rounded-xl border border-[#E1E0CC]/10 transition-all text-[#E1E0CC]/60 hover:text-[#E1E0CC] relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0A0A0A] border border-[#E1E0CC]/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#E1E0CC]/10">
                <h4 className="text-xs font-black text-[#E1E0CC] uppercase tracking-wider">Notifications</h4>
                <button onClick={() => setShowNotifications(false)} className="text-[#E1E0CC]/50 hover:text-[#E1E0CC]/80 text-xs">Close</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-[#E1E0CC]/50 text-center py-4 font-mono">No new notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="pt-2 text-xs text-[#E1E0CC]/70">
                      <h5 className="font-bold text-[#E1E0CC]">{n.title}</h5>
                      <p className="text-[10px] text-[#E1E0CC]/60 mt-0.5">{n.message || n.time}</p>
                      {n.created_at && (
                        <span className="text-[8px] text-[#E1E0CC]/50 block mt-1">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Card */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#E1E0CC]/10">
          {userAvatar ? (
            <img src={userAvatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-[#E1E0CC]/15" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#101010] flex items-center justify-center text-white font-bold text-xs uppercase">
              {userName?.charAt(0) || "U"}
            </div>
          )}
          <span className="hidden sm:inline text-xs font-bold text-[#E1E0CC]/80 max-w-[80px] truncate">{userName || "User"}</span>
        </div>
      </div>
    </div>
  );
}
