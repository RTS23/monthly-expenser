import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const FileUpload = ({ onUpload, existingImage = null, label = "Upload Receipt" }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(existingImage);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const { t } = useSettings(); // Assuming we might want to translate this later

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        // Create local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            const formData = new FormData();
            formData.append('receipt', file);

            // Access backend URL from environment or default to relative path proxy
            // Since we're in dev, usually vite proxies /api to backend. 
            // In layout/Shell.jsx we usually see standard fetch usage.
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // data.url should be something like /uploads/filename.jpg
            onUpload(data.url);
        } catch (err) {
            console.error(err);
            setError('Failed to upload image. Please try again.');
            setPreview(null); // Revert preview on error
            onUpload(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
            </label>

            {error && (
                <p className="text-red-400 text-sm mb-2">{error}</p>
            )}

            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed border-slate-700 hover:border-indigo-500/50 
                        bg-slate-800/30 hover:bg-slate-800/50 
                        rounded-xl p-6 cursor-pointer transition-all
                        flex flex-col items-center justify-center gap-2
                        group
                        ${uploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                        {uploading ? (
                            <Loader2 size={20} className="text-indigo-400 animate-spin" />
                        ) : (
                            <Upload size={20} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        )}
                    </div>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300">
                        {uploading ? 'Uploading...' : 'Click to select image'}
                    </p>
                    <p className="text-xs text-slate-500">
                        Max 5MB (JPG, PNG, WebP)
                    </p>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-700/50 group">
                    <img
                        src={preview}
                        alt="Receipt preview"
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-all transform scale-90 group-hover:scale-100"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

export default FileUpload;
