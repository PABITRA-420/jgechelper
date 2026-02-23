"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, File, X } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface AdminFileUploadProps {
    onUploadComplete?: (url: string, fileName: string) => void;
    folderPath?: string;
    accept?: string;
}

export default function AdminFileUpload({
    onUploadComplete,
    folderPath = "uploads",
    accept = "*",
}: AdminFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validateAndSetFile = (selectedFile: File) => {
        setError(null);
        setIsSuccess(false);
        setUploadProgress(0);
        setFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setFile(null);
        setUploadProgress(0);
        setIsSuccess(false);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUpload = () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        // Create a unique file name
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `${folderPath}/${uniqueFileName}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (err) => {
                setIsUploading(false);
                setError(err.message || "Failed to upload file. Please try again.");
            },
            async () => {
                // Upload completed successfully
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setIsUploading(false);
                    setIsSuccess(true);
                    setUploadProgress(100);
                    if (onUploadComplete) {
                        onUploadComplete(downloadURL, file.name);
                    }
                } catch (err: any) {
                    setIsUploading(false);
                    setError("Error getting download URL: " + err.message);
                }
            }
        );
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                    />
                    <div
                        className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                    >
                        <UploadCloud size={32} />
                    </div>
                    <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Drag & drop your file here
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        or click to browse from your computer
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4 overflow-hidden pr-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                                <File size={24} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                    {file.name}
                                </h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        </div>

                        {!isUploading && !isSuccess && (
                            <button
                                onClick={clearFile}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                title="Remove file"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-500/20">
                            {error}
                        </div>
                    )}

                    {isUploading || isSuccess ? (
                        <div className="space-y-2 relative">
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className={isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}>
                                    {isSuccess ? "Upload complete" : "Uploading..."}
                                </span>
                                <span className="text-zinc-500 font-tabular-nums">
                                    {Math.round(uploadProgress)}%
                                </span>
                            </div>
                            <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ease-out ${isSuccess ? "bg-emerald-500" : "bg-blue-500"
                                        }`}
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>

                            {/* Success Checkmark Animation */}
                            {isSuccess && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none mt-8">
                                    <div className="flex flex-col items-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-500/20 animate-fade-in-up z-10">
                                        <CheckCircle className="w-16 h-16 text-emerald-500 mb-3" />
                                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-lg">Successfully Uploaded!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={clearFile}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-900 transition-colors flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm transition-all flex-1 flex items-center justify-center gap-2"
                            >
                                <UploadCloud size={18} />
                                Upload File
                            </button>
                        </div>
                    )}

                    {isSuccess && (
                        <button
                            onClick={clearFile}
                            className="mt-6 w-full px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-lg hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Upload Another File
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
