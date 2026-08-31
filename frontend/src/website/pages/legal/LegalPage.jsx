import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SEO from "../../components/seo/SEO";
import { LEGAL_POLICIES, GRIEVANCE_OFFICER, LegalSection } from "../../data/legalData";
import {
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  RotateCcw,
  CalendarX,
  Truck,
  Undo2,
  AlertTriangle,
  Eye,
  Database,
  ShieldAlert,
  Search,
  Printer,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ICONS_MAP = {
  "privacy-policy": Lock,
  "terms-of-service": FileText,
  "cookie-policy": Cookie,
  "refund-policy": RotateCcw,
  "cancellation-policy": CalendarX,
  "shipping-policy": Truck,
  "return-policy": Undo2,
  "disclaimer": AlertTriangle,
  "accessibility-statement": Eye,
  "dpa": Database,
  "acceptable-use": ShieldAlert,
  "security-policy": ShieldCheck,
  "responsible-disclosure": Sparkles,
  "community-guidelines": CheckCircle2,
};

const CATEGORIES = [
  "Legal & Terms",
  "Privacy & Data",
  "Bookings & Refunds",
  "Safety & Security",
];

export default function LegalPage({ defaultSlug = "terms-of-service" }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  // Determine active policy
  const activeSlug = slug || defaultSlug || "terms-of-service";
  const policy = LEGAL_POLICIES[activeSlug] || LEGAL_POLICIES["terms-of-service"];

  const filteredPolicies = Object.values(LEGAL_POLICIES).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  function handlePrint() {
    window.print();
  }

  const ActiveIcon = ICONS_MAP[policy.slug] || FileText;

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-body text-[#063247] flex flex-col justify-between">
      <SEO
        title={`${policy.title} — Cab Castle Goa Legal & Compliance`}
        description={policy.shortDescription}
      />
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        {/* Header Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8496A2]">
          <div className="flex items-center gap-1.5 font-medium">
            <Link to="/" className="hover:text-[#288DA6] transition-colors">
              Home
            </Link>
            <ChevronRight size={13} />
            <Link to="/legal" className="hover:text-[#288DA6] transition-colors">
              Legal &amp; Compliance Center
            </Link>
            <ChevronRight size={13} />
            <span className="text-[#063247] font-bold">{policy.title}</span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DFE8EC] hover:bg-[#F8FAFC] text-[#063247] font-semibold text-xs transition-colors shadow-2xs cursor-pointer print:hidden"
          >
            <Printer size={13} className="text-[#288DA6]" />
            <span>Print Document</span>
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Sidebar: Navigation */}
          <aside className="lg:col-span-4 bg-white rounded-3xl border border-[#DFE8EC] p-5 shadow-xs lg:sticky lg:top-24 space-y-5 print:hidden">
            <div>
              <h3 className="font-display font-bold text-base text-[#063247]">
                Legal &amp; Compliance Directory
              </h3>
              <p className="text-xs text-[#8496A2] mt-0.5">
                Statutory regulatory documents for Cab Castle Goa.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search policies, clauses..."
                className="pl-8.5 h-9 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247]"
              />
            </div>

            {/* Categorized List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const items = filteredPolicies.filter((p) => p.category === cat);
                if (items.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8496A2] px-2.5">
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
                                ? "bg-[#063247] text-white shadow-xs"
                                : "text-[#4C606E] hover:bg-[#F8FAFC] hover:text-[#063247]"
                            }`}
                          >
                            <Icon size={14} className={isActive ? "text-[#2A8FA8]" : "text-[#8496A2]"} />
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
          <article className="lg:col-span-8 bg-white rounded-3xl border border-[#DFE8EC] p-6 sm:p-10 shadow-xs space-y-8 text-left">
            {/* Policy Title Banner */}
            <div className="border-b border-[#DFE8EC] pb-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#E4F2F5] text-[#2A8FA8] border border-[#C3E7FA]">
                <ActiveIcon size={13} />
                <span>{policy.category}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#063247] tracking-tight font-display">
                {policy.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#4C606E] leading-relaxed">
                {policy.shortDescription}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[#8496A2]">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#2A8FA8]" />
                  <span>Last Updated: <strong className="text-[#063247]">{policy.lastUpdated}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate max-w-full">
                  <ShieldCheck size={13} className="text-[#2A8FA8]" />
                  <span className="truncate">{policy.statutoryReference}</span>
                </span>
              </div>
            </div>

            {/* Sections & Clauses */}
            <div className="space-y-8 text-xs sm:text-sm text-[#334155] leading-relaxed">
              {policy.content.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-[#063247] font-display">
                    {sec.heading}
                  </h2>

                  {sec.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {sec.bullets && (
                    <ul className="space-y-2 list-disc list-outside pl-5 text-xs sm:text-sm text-[#475569]">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.table && (
                    <div className="overflow-x-auto my-3 border border-[#DFE8EC] rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-[#DFE8EC] font-bold text-[#063247]">
                            {sec.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE8EC]">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#F8FAFC]/60">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-[#475569]">
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
            <div className="mt-10 p-6 rounded-2xl bg-[#F8FAFC] border border-[#DFE8EC] space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-[#2A8FA8]" />
                <h3 className="font-display font-bold text-sm text-[#063247]">
                  Statutory Grievance &amp; Compliance Redressal
                </h3>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Digital Personal Data Protection Act (DPDP) 2023, the details of the designated Grievance Officer are published below:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8496A2]">Officer Name</span>
                  <span className="font-bold text-[#063247]">{GRIEVANCE_OFFICER.name}</span>
                  <span className="block text-[11px] text-[#475569]">{GRIEVANCE_OFFICER.designation}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8496A2]">Registered Office</span>
                  <span className="font-medium text-[#063247]">{GRIEVANCE_OFFICER.address}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8496A2]">Grievance Email</span>
                  <a href={`mailto:${GRIEVANCE_OFFICER.email}`} className="text-[#2A8FA8] hover:underline font-medium">
                    {GRIEVANCE_OFFICER.email}
                  </a>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8496A2]">Hotline &amp; SLA</span>
                  <span className="font-medium text-[#063247]">{GRIEVANCE_OFFICER.hotline}</span>
                  <span className="block text-[10px] text-[#8496A2]">Response: {GRIEVANCE_OFFICER.responseSLA}</span>
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
