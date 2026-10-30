"use client";

import { useState, useTransition } from "react";
import { importListingsAction, ImportListingInput } from "@/actions/admin";

const SAMPLE_CSV = `title,categorySlug,locationSlug,phone,whatsapp,email,website,address,locality,description
Saudagar Fitness Hub,gyms-fitness,pimple-saudagar,9876543210,9876543210,contact@saudagarfit.in,https://saudagarfit.in,Shop 14 Rainbow Plaza Shivar Garden,Pimple Saudagar,Premium 24x7 fitness center with personal trainers and CrossFit.
Kunal Sweets & Snacks,restaurants-cafes,kunalgarden,9823001122,,sweets@kunal.com,,Shop 3 Kunal Icon Road Shivar Chowk,Kunal Icon Road,Authentic Maharashtrian sweets and hot snacks.
Dr. Joshi Dental Clinic,dentists-dental-care,pimple-saudagar,9922334455,,,https://drjoshidental.in,Office 201 Vision 9 Mall,Pimple Saudagar,Comprehensive root canal and cosmetic dentistry.
Green Earth Nursery,home-services-repairs,govind-garden,9123456789,,,,Near Govind Garden Chowk,Govind Garden,Indoor plants pots organic soil and gardening tools.`;

export function CsvImporter() {
  const [csvContent, setCsvContent] = useState("");
  const [parsedRows, setParsedRows] = useState<ImportListingInput[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    importedCount?: number;
    failedCount?: number;
    errors?: string[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleParseCsv = (content: string) => {
    setCsvContent(content);
    setImportStatus(null);

    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      setParsedRows([]);
      setValidationErrors(["CSV must contain at least a header row and one data row."]);
      return;
    }

    const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["title", "address"];
    const missing = requiredHeaders.filter((req) => !headers.includes(req));

    if (missing.length > 0) {
      setParsedRows([]);
      setValidationErrors([`Missing required column headers: ${missing.join(", ")}`]);
      return;
    }

    const rows: ImportListingInput[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      // Handle simple CSV splitting (quoted strings or simple commas)
      const values = line.split(",").map((v) => v.trim());
      const rowObj: any = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] || "";
      });

      if (!rowObj.title) {
        errors.push(`Row ${i + 1}: Title is missing.`);
      } else if (!rowObj.address) {
        errors.push(`Row ${i + 1}: Address is missing.`);
      } else {
        rows.push({
          title: rowObj.title,
          categorySlug: rowObj.categoryslug || "",
          locationSlug: rowObj.locationslug || "",
          phone: rowObj.phone || undefined,
          whatsapp: rowObj.whatsapp || undefined,
          email: rowObj.email || undefined,
          website: rowObj.website || undefined,
          address: rowObj.address,
          locality: rowObj.locality || "Pimple Saudagar",
          description: rowObj.description || undefined,
        });
      }
    }

    setParsedRows(rows);
    setValidationErrors(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    startTransition(async () => {
      const res = await importListingsAction(parsedRows);
      setImportStatus(res);
      if (res.success && (!res.failedCount || res.failedCount === 0)) {
        setParsedRows([]);
        setCsvContent("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload & Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Upload or Paste CSV</h2>
            <p className="text-xs text-slate-500">
              Columns: title, categorySlug, locationSlug, phone, whatsapp, email, website, address, locality, description
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleParseCsv(SAMPLE_CSV)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Load Sample Data
            </button>
            <label className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition">
              Select CSV File
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <textarea
            value={csvContent}
            onChange={(e) => handleParseCsv(e.target.value)}
            placeholder="Paste raw CSV content here or click 'Load Sample Data' above..."
            rows={6}
            className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Validation Feedback */}
      {validationErrors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p className="font-bold">Validation Warnings:</p>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Import Execution Result */}
      {importStatus && (
        <div
          className={`rounded-xl border p-4 text-xs ${
            importStatus.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="font-bold text-sm">
            {importStatus.success
              ? `✓ Successfully imported ${importStatus.importedCount} business listings!`
              : "Import Failed"}
          </div>
          {importStatus.failedCount && importStatus.failedCount > 0 ? (
            <div className="mt-1">
              <p className="font-medium text-amber-700">{importStatus.failedCount} rows failed:</p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-amber-700">
                {importStatus.errors?.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Ready to Import ({parsedRows.length} Valid Listings)
            </h3>
            <button
              onClick={handleExecuteImport}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isPending ? "Importing Records..." : `Confirm & Import ${parsedRows.length} Listings`}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Business Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Website</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{row.title}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          {row.categorySlug || "Default"}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{row.address}</td>
                      <td className="px-4 py-3">{row.phone || "—"}</td>
                      <td className="px-4 py-3 truncate max-w-[150px]">{row.website || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
