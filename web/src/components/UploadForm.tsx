"use client";

import { UploadCloud, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

export function UploadForm({ editingResource, onClearEdit }: { editingResource?: any, onClearEdit?: () => void }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [existingAttachment, setExistingAttachment] = useState<{ url: string | null, name: string | null }>({ url: null, name: null });
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [branch, setBranch] = useState("CSE");
    const [semester, setSemester] = useState("1st Semester");
    const [type, setType] = useState("Question Paper");

    useEffect(() => {
        if (editingResource) {
            setTitle(editingResource.title || "");
            setSubject(editingResource.subject || "");
            setBranch(editingResource.branch || "CSE");
            setSemester(editingResource.semester || "1st Semester");
            setType(editingResource.type || "Question Paper");
            setExistingAttachment({
                url: editingResource.downloadURL || null,
                name: editingResource.fileName || null
            });
            setFile(null);
            setSuccess(false);
            setError(null);
        } else {
            resetForm();
        }
    }, [editingResource]);

    const resetForm = () => {
        setTitle("");
        setSubject("");
        setBranch("CSE");
        setSemester("1st Semester");
        setType("Question Paper");
        setFile(null);
        setExistingAttachment({ url: null, name: null });
        setSuccess(false);
        setError(null);
    };

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
            setExistingAttachment({ url: null, name: null });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setExistingAttachment({ url: null, name: null });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if ((!file && !existingAttachment.url) || !title || !subject) {
            setError("Please fill in all fields and provide a file.");
            return;
        }

        setUploading(true);

        try {
            let currentDownloadURL = existingAttachment.url;
            let currentFileName = existingAttachment.name;

            if (file) {
                // 1. Upload File to Vercel Blob via Next.js API
                const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                    method: "POST",
                    body: file,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || "Failed to upload file");
                }

                const blob = await uploadResponse.json();
                currentDownloadURL = blob.url;
                currentFileName = file.name;
            }

            if (editingResource) {
                // Update Existing Resource
                await updateDoc(doc(db, "resources", editingResource.id), {
                    title,
                    subject,
                    branch,
                    semester,
                    type,
                    downloadURL: currentDownloadURL,
                    fileName: currentFileName,
                });

                setSuccess(true);
                if (onClearEdit) onClearEdit();
            } else {
                // 2. Save Metadata to Firestore
                await addDoc(collection(db, "resources"), {
                    title,
                    subject,
                    branch,
                    semester,
                    type,
                    downloadURL: currentDownloadURL,
                    fileName: currentFileName,
                    createdAt: serverTimestamp(),
                });

                setSuccess(true);
                resetForm();
            }
        } catch (err) {
            console.error("Upload failed", err);
            setError(`Failed to ${editingResource ? 'update' : 'upload'} resource. Please try again.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editingResource ? "Edit Resource" : "Upload Resource"}</h3>
                {editingResource && onClearEdit && (
                    <button type="button" onClick={onClearEdit} className="text-sm text-muted-foreground hover:text-foreground">
                        Cancel Edit
                    </button>
                )}
            </div>

            <form className="space-y-4" onSubmit={handleUpload}>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Data Structures Notes"
                            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Subject Code/Name</label>
                        <input
                            type="text"
                            placeholder="e.g. PCC-CS-301"
                            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Branch</label>
                        <select
                            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                        >
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">CSE</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">IT</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">ECE</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">ME</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">EE</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">CE</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Semester</label>
                        <select
                            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        >
                            {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((sem) => (
                                <option key={sem} value={`${sem} Semester`} className="bg-white text-black dark:bg-zinc-900 dark:text-white">{sem} Semester</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Type</label>
                        <select
                            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">Question Paper</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">Notes</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">Routine</option>
                            <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">Others</option>
                        </select>
                    </div>
                </div>

                {/* Drag & Drop Zone */}
                <div
                    className={`relative mt-4 flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-zinc-300 dark:border-zinc-700"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx"
                    />

                    {file || existingAttachment.url ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            <FileText className="h-4 w-4 text-blue-500" />
                            {file ? file.name : existingAttachment.name}
                            <button onClick={(e) => { e.preventDefault(); setFile(null); setExistingAttachment({ url: null, name: null }); }} className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                <X className="h-4 w-4 text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className={`mb-2 h-8 w-8 ${dragActive ? "text-blue-500" : "text-zinc-400"}`} />
                            <p className="text-sm text-zinc-500">
                                <span className="font-semibold text-blue-500">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-zinc-400">PDF, DOC up to 10MB</p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/10 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        {editingResource ? "Resource updated successfully!" : "Resource uploaded successfully!"}
                    </div>
                )}

                <button
                    disabled={uploading}
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {uploading ? "Saving..." : (editingResource ? "Update Resource" : "Upload Resource")}
                </button>
            </form>
        </div>
    );
}
