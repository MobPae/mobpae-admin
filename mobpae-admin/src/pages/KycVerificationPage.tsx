import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import KycStats from "../components/kyc/KycStats";
import KycTable from "../components/kyc/KycTable";
import KycDrawer from "../components/kyc/KycDrawer";

import { getKycDocuments, type KycStatusFilter } from "../services/kycService";
import type { KycDocument } from "../types/kyc";

const statusTabs: Array<{ label: string; value: KycStatusFilter }> = [
  { label: "Pending", value: "PENDING" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
];

export default function KycVerificationPage() {
  const [loading, setLoading] = useState(true);

  const [documents, setDocuments] = useState<KycDocument[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState<KycStatusFilter>("PENDING");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(
    null
  );

  async function loadDocuments() {
    setLoading(true);

    try {
      const data = await getKycDocuments(statusFilter);

      setDocuments(data || []);
    } catch (error) {
      console.error("Failed to load KYC documents", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [statusFilter]);

  const filteredDocuments = documents.filter((document) => {
    const employeeName = document.employee?.name || "";

    const employeeCode = document.employee?.employeeCode || "";

    const documentType = document.documentType || "";

    return (
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documentType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading KYC documents...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">KYC Verification</h1>

        <p className="text-slate-500 mt-2">
          Review and verify employee KYC documents.
        </p>
      </div>

      <KycStats documents={documents} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-fit rounded-2xl border border-slate-200 bg-white p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                statusFilter === tab.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search KYC documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full
              h-10
              pl-10
              pr-4
              text-sm
              bg-white
              border
              border-slate-200
              rounded-xl
              outline-none
              focus:border-blue-500
            "
          />
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No KYC Documents Found
          </h3>

          <p className="text-slate-500 mt-2">
            No {statusFilter.toLowerCase()} KYC documents match this view.
          </p>
        </div>
      ) : (
        <KycTable
          documents={filteredDocuments}
          onReview={(document) => {
            setSelectedDocument(document);
            setDrawerOpen(true);
          }}
        />
      )}

      <KycDrawer
        open={drawerOpen}
        document={selectedDocument}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDocument(null);
        }}
        onCompleted={() => {
          setDrawerOpen(false);
          setSelectedDocument(null);
          loadDocuments();
        }}
      />
    </div>
  );
}
