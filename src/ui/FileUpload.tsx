import React, { useEffect, useRef, useState } from "react";

interface FileUploadProps { onFileSelect: (file: File | null) => void; }

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const selectFile = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    if (file?.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
      onFileSelect(file);
      return;
    }
    setPreview(null);
    setFileName(null);
    onFileSelect(null);
  };

  return (
    <div className={`upload-zone ${isDragging ? "is-dragging" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0] ?? null); }}>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)} hidden />
      <button className="upload-button" type="button" onClick={() => inputRef.current?.click()}>
        {preview ? <img src={preview} alt="Token artwork preview" /> :
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" /></svg>}
      </button>
      <div className="upload-copy">
        <strong>{fileName ?? "Drop your token artwork"}</strong>
        <span>{fileName ? "Click the preview to replace it" : "or click to browse · PNG, JPG, WEBP or GIF"}</span>
      </div>
      <button className="text-button" type="button" onClick={() => inputRef.current?.click()}>{preview ? "Replace" : "Browse"}</button>
    </div>
  );
};

export default FileUpload;
