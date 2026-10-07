import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiArrowLeft, FiUsers, FiClock, FiCpu, FiCheckCircle } from 'react-icons/fi';

const PlaceholderView = ({ 
    title = "Module in Development", 
    description = "This manufacturing workspace module is currently being engineered and optimized for production deployment.",
    icon: Icon = FiLayers,
    badgeText = "Under Active Engineering",
    features = [
        "Real-time garment line telemetry and dispatch sync",
        "Automated resource allocation & smart factory scheduling",
        "Granular audit trails and role-based permissions"
    ]
}) => {
    return (
        <div className="min-h-full p-4 md:p-6 lg:p-8 flex flex-col bg-[#F5F5F7] rounded-3xl border border-[#E5E5EA]">
            {/* Top Breadcrumb / Module Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF] animate-pulse"></span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
                        Apparel ERP System
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                    {title}
                </h1>
                <p className="text-sm text-[#86868B] mt-1 max-w-2xl">
                    {description}
                </p>
            </div>

            {/* Apple Card Container */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-8 md:p-12 shadow-xs flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto w-full">
                {/* Hero Icon */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50/80 text-[#007AFF] flex items-center justify-center border border-blue-100 shadow-sm">
                        <Icon className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
                        <FiClock className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* Status Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#007AFF] border border-blue-200/60 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
                    {badgeText}
                </span>

                <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                    {title} Workspace
                </h2>
                
                <p className="text-sm text-[#86868B] mt-2 max-w-md">
                    This module is undergoing final calibration and safety verification. The features below will be activated in the upcoming update.
                </p>

                {/* Upcoming capabilities checklist */}
                {features && features.length > 0 && (
                    <div className="w-full max-w-md mt-6 p-4 bg-[#F5F5F7]/80 rounded-xl border border-[#E5E5EA] text-left">
                        <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-2.5">
                            Upcoming Factory Capabilities
                        </span>
                        <ul className="space-y-2">
                            {features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-[#1D1D1F]">
                                    <span className="text-emerald-600 mt-0.5 flex-shrink-0">✓</span>
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Quick Action Navigation Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#1D1D1F] text-xs font-semibold border border-[#E5E5EA] shadow-2xs transition-all hover:scale-[1.02] text-decoration-none"
                    >
                        <FiArrowLeft size={14} />
                        Return to Dashboard
                    </Link>

                    <Link
                        to="/admin/user-management"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] text-decoration-none"
                    >
                        <FiUsers size={14} />
                        Manage Workforce & HCM
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderView;
