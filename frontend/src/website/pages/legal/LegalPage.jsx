/* Cab Castle Goa Design System - Legal & Compliance Center (Mint #69A481, White Smoke #E7EDEB, Claret #7C1F31) */
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LEGAL_POLICIES, GRIEVANCE_OFFICER } from "../../data/legalData";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SEO from "../../components/seo/SEO";
import { Input } from "@/components/ui/input";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Scale,
  Cookie,
  CreditCard,
  Briefcase,
  ChevronRight,
  Printer,
  Search,
  Clock,
  Phone,
  Mail,
  MapPin,
  Lock,
  Users,
  Shield
} from "lucide-react";

const ICONS_MAP = {
  "terms-of-service": Scale,
  "terms-and-conditions": Scale,
  "privacy-policy": ShieldCheck,
  "refund-policy": RotateCcw,
  "refund-and-cancellation": RotateCcw,
  "rental-guidelines": Briefcase,
  "rental-agreement": Briefcase,
  "cookie-policy": Cookie,
  "pricing-payments": CreditCard,
  "pricing-and-payments": CreditCard,
  "security-policy": Lock,
  "responsible-disclosure": Shield,
  "community-guidelines": Users,
};

const CATEGORIES = [
  "Legal & Terms",
  "Privacy & Data",
  "Bookings & Refunds",
  "Safety & Security",
];

export default function LegalPage({ defaultSlug } = {}) {
  const { slug, policySlug } = useParams();
  const [search, setSearch] = useState("");

  const policyList = Object.values(LEGAL_POLICIES);

  // Resolve current active policy document
  const currentSlug = slug || policySlug || defaultSlug || "terms-of-service";
  const policy =
    LEGAL_POLICIES[currentSlug] ||
    policyList.find((p) => p.slug === currentSlug) ||
    policyList[0];

  const filteredPolicies = policyList.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  const ActiveIcon = ICONS_MAP[policy.slug] || FileText;

  return (
    <div className="min-h-screen bg-[#E7EDEB] font-body text-[#1B2922] flex flex-col justify-between">
      <SEO
        title={`${policy.title} — Cab Castle Goa Legal & Compliance`}
        description={policy.shortDescription}
      />
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        {/* Header Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6C8277]">
          <div className="flex items-center gap-1.5 font-medium">
            <Link to="/" className="hover:text-[#7C1F31] transition-colors">
              Home
            </Link>
            <ChevronRight size={13} />
            <Link to="/legal" className="hover:text-[#7C1F31] transition-colors">
              Legal &amp; Compliance Center
            </Link>
            <ChevronRight size={13} />
            <span className="text-[#1B2922] font-bold">{policy.title}</span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CBD8D4] hover:bg-[#DEEDE4] text-[#1B2922] font-semibold text-xs transition-colors shadow-2xs cursor-pointer print:hidden"
          >
            <Printer size={13} className="text-[#69A481]" />
            <span>Print Document</span>
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Sidebar: Navigation */}
          <aside className="lg:col-span-4 bg-white rounded-3xl border border-[#CBD8D4] p-5 shadow-xs lg:sticky lg:top-24 space-y-5 print:hidden">
            <div>
              <h3 className="font-display font-bold text-base text-[#1B2922]">
                Legal &amp; Compliance Directory
              </h3>
              <p className="text-xs text-[#6C8277] mt-0.5">
                Statutory regulatory documents for Cab Castle Goa.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8277]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search policies, clauses..."
                className="pl-8.5 h-9 text-xs bg-[#E7EDEB] border-[#CBD8D4] rounded-xl text-[#1B2922] focus:border-[#69A481]"
              />
            </div>

            {/* Categorized List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const items = filteredPolicies.filter((p) => p.category === cat);
                if (items.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#6C8277] px-2.5">
                      {cat}
                    </div>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const Icon = ICONS_MAP[item.slug] || FileText;
                        const isActive = item.slug === policy.slug;

                        return (
                          <Link
                            key={item.slug}
                            to={`/legal/${item.slug}`}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-[#7C1F31] text-white shadow-xs"
                                : "text-[#4D6257] hover:bg-[#DEEDE4] hover:text-[#1B2922]"
                            }`}
                          >
                            <Icon size={14} className={isActive ? "text-white" : "text-[#69A481]"} />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Document Content Reader */}
          <article className="lg:col-span-8 bg-white rounded-3xl border border-[#CBD8D4] p-6 sm:p-10 shadow-xs space-y-8 text-left">
            {/* Policy Title Banner */}
            <div className="border-b border-[#CBD8D4] pb-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#DEEDE4] text-[#245339] border border-[#69A481]/30">
                <ActiveIcon size={13} className="text-[#69A481]" />
                <span>{policy.category}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1B2922] tracking-tight font-display">
                {policy.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#4D6257] leading-relaxed">
                {policy.shortDescription}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[#6C8277]">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#69A481]" />
                  <span>Last Updated: <strong className="text-[#1B2922]">{policy.lastUpdated}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate max-w-full">
                  <ShieldCheck size={13} className="text-[#69A481]" />
                  <span className="truncate">{policy.statutoryReference}</span>
                </span>
              </div>
            </div>

            {/* Sections & Clauses */}
            <div className="space-y-8 text-xs sm:text-sm text-[#1B2922] leading-relaxed">
              {policy.content.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-[#1B2922] font-display">
                    {sec.heading}
                  </h2>

                  {sec.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-[#4D6257] leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {sec.bullets && (
                    <ul className="space-y-2 list-disc list-outside pl-5 text-xs sm:text-sm text-[#4D6257]">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.table && (
                    <div className="overflow-x-auto my-3 border border-[#CBD8D4] rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#E7EDEB] border-b border-[#CBD8D4] font-bold text-[#1B2922]">
                            {sec.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CBD8D4]">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#DEEDE4]/40">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-[#4D6257]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Statutory Grievance Redressal Card */}
            <div className="mt-10 p-6 rounded-2xl bg-[#E7EDEB] border border-[#CBD8D4] space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-[#69A481]" />
                <h3 className="font-display font-bold text-sm text-[#1B2922]">
                  Statutory Grievance &amp; Compliance Redressal
                </h3>
              </div>
              <p className="text-xs text-[#4D6257] leading-relaxed">
                In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Digital Personal Data Protection Act (DPDP) 2023, the details of the designated Grievance Officer are published below:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6C8277]">Officer Name</span>
                  <span className="font-bold text-[#1B2922]">{GRIEVANCE_OFFICER.name}</span>
                  <span className="block text-[11px] text-[#4D6257]">{GRIEVANCE_OFFICER.designation}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6C8277]">Registered Office</span>
                  <span className="font-medium text-[#1B2922]">{GRIEVANCE_OFFICER.address}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6C8277]">Grievance Email</span>
                  <a href={`mailto:${GRIEVANCE_OFFICER.email}`} className="text-[#7C1F31] hover:underline font-medium">
                    {GRIEVANCE_OFFICER.email}
                  </a>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6C8277]">Hotline &amp; SLA</span>
                  <span className="font-medium text-[#1B2922]">{GRIEVANCE_OFFICER.hotline}</span>
                  <span className="block text-[10px] text-[#6C8277]">Response: {GRIEVANCE_OFFICER.responseSLA}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
