import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileDropzone({ onFilesSelected, accept, multiple = true, className }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Only set isDragging to false if we're leaving the dropzone completely
        if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            onFilesSelected(multiple ? fileArray : [fileArray[0]]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target?.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            onFilesSelected(fileArray);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            ref={dropZoneRef}
            className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-slate-50",
                className
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
            />
            <Upload className={cn(
                "w-12 h-12 mx-auto mb-4 transition-colors",
                isDragging ? "text-blue-500" : "text-slate-400"
            )} />
            <p className={cn(
                "mb-2 transition-colors",
                isDragging ? "text-blue-600 font-medium" : "text-slate-600"
            )}>
                {isDragging ? "Dateien hier ablegen..." : (
                    <>
                        Dateien hierher ziehen oder <span className="text-blue-600 font-medium">klicken zum Auswählen</span>
                    </>
                )}
            </p>
            <p className="text-sm text-slate-500">
                {multiple ? "Mehrere Dateien möglich" : "Eine Datei"}
            </p>
        </div>
    );
}