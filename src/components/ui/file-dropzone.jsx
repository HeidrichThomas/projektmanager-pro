import React, { useState } from "react";
import { Upload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileDropzone({ onFilesSelected, accept, multiple = true, className }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFilesSelected(multiple ? files : [files[0]]);
        }
    };

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onFilesSelected(files);
        }
    };

    return (
        <div
            className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400",
                className
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input-dropzone').click()}
        >
            <input
                id="file-input-dropzone"
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-2">
                Dateien hierher ziehen oder <span className="text-blue-600 font-medium">klicken zum Auswählen</span>
            </p>
            <p className="text-sm text-slate-500">
                {multiple ? "Mehrere Dateien möglich" : "Eine Datei"}
            </p>
        </div>
    );
}