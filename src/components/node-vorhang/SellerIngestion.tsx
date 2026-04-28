"use client";

import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export default function SellerIngestion({ basePath = "" }: { basePath?: string }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    
    try {
      // 1. Upload file to Firebase Storage
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import("firebase/storage");
      const { storage } = await import("@/lib/firebase-client");
      
      const fileRef = storageRef(storage, `vorhang_catalogs/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // 2. Save metadata to Firestore
      await addDoc(collection(db, "vorhang_catalogs"), {
        filename: file.name,
        size: file.size,
        fileUrl: downloadURL,
        timestamp: new Date().toISOString(),
        status: "processing"
      });
      setStatus("success");
    } catch (error) {
      console.error("Error uploading catalog:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col">
      <VorhangNavbar />
      
      <main className="flex-1 pt-32 pb-24 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link href={`${basePath}/seller`} className="text-sm text-gray-500 hover:text-black mb-4 inline-block transition-colors">
            &larr; Zurück zum Dashboard
          </Link>
          <h1 className="text-4xl font-serif mb-2 text-black">Produktkatalog Hochladen</h1>
          <p className="text-gray-500">Laden Sie Ihre CSV- oder Excel-Datei hoch, um Produkte massenhaft hinzuzufügen.</p>
        </div>

        <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm">
          {status === "success" ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-serif mb-2">Upload Erfolgreich!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Ihre Produktdaten wurden erfolgreich übermittelt. Unsere KI verarbeitet nun die Bilder und erstellt die Vorhang-Visualisierungen.
              </p>
              <button 
                onClick={() => { setFile(null); setStatus("idle"); }}
                className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all"
              >
                Weitere Datei Hochladen
              </button>
            </div>
          ) : (
            <>
              <div 
                className={`border-2 border-dashed rounded-sm p-12 text-center transition-colors ${dragActive ? 'border-black bg-gray-50' : 'border-gray-300'} ${file ? 'bg-gray-50 border-gray-400' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-bold text-lg mb-2">CSV oder Excel-Datei hierher ziehen</p>
                    <p className="text-gray-500 text-sm mb-6">Max. Dateigröße: 50MB</p>
                    
                    <label className="bg-white border border-gray-300 px-6 py-3 cursor-pointer text-sm font-medium hover:border-black transition-colors">
                      Datei Auswählen
                      <input type="file" className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleChange} />
                    </label>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-black mx-auto mb-4" />
                    <p className="font-bold text-lg mb-2">{file.name}</p>
                    <p className="text-gray-500 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Datei entfernen
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleUpload}
                  disabled={!file || status === "uploading"}
                  className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37] transition-all disabled:opacity-50 disabled:hover:bg-black"
                >
                  {status === "uploading" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verarbeitung...
                    </>
                  ) : (
                    <>
                      Katalog Hochladen
                    </>
                  )}
                </button>
              </div>

              <div className="mt-10 bg-blue-50 border border-blue-100 p-4 flex gap-3 text-sm text-blue-800 rounded-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
                <div>
                  <p className="font-bold mb-1">Hinweis zur Formatierung</p>
                  <p>Stellen Sie sicher, dass Ihre Datei die erforderlichen Spalten enthält: Artikelnummer, Name, Beschreibung, Preis, Bestand und Bild-URLs. Sie können unsere <a href="#" className="underline">Mustervorlage hier herunterladen</a>.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <VorhangFooter />
    </div>
  );
}
