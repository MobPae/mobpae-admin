import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import KycStats from "../components/kyc/KycStats";
import KycTable from "../components/kyc/KycTable";
import KycDrawer from "../components/kyc/KycDrawer";

import { getPendingKycDocuments } from "../services/kycService";
import type { KycDocument } from "../types/kyc";

export default function KycVerificationPage() {
  const [loading, setLoading] = useState(true);

  const [documents, setDocuments] = useState<KycDocument[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(
    null
  );

  async function loadDocuments() {
    setLoading(true);

    try {
      const data = await getPendingKycDocuments();

      setDocuments(data || []);
    } catch (error) {
      console.error("Failed to load KYC documents", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

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

      {filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No KYC Documents Found
          </h3>

          <p className="text-slate-500 mt-2">
            KYC submissions will appear here once employees upload documents.
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
