import { Metadata } from "next";
import { CsvImporter } from "./csv-importer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulk CSV Import | Admin Back-Office",
  description: "Batch import local businesses and listings into the Pimple Saudagar directory.",
};

export default function AdminImportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bulk Business Import</h1>
        <p className="text-sm text-slate-500">
          Upload or paste CSV data to quickly seed or migrate hundreds of local businesses.
        </p>
      </div>

      <CsvImporter />
    </div>
  );
}
