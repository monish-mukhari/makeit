import React, { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
      onFileSelect(file);
    } else {
      setPreview(null);
      setFileName(null);
      onFileSelect(null);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <label className="text-black font-medium">* Image:</label>
      <div className='flex'>
        <div className="w-44 h-44 flex items-center justify-center border border-gray-600 rounded-md overflow-hidden">
            {preview ? (
            <img src={preview} alt="Preview" className="object-cover h-24 w-24"  />
            ) : (
            <span className="text-gray-400">No image uploaded</span>
            )}
        </div>

        <div className='flex flex-col justify-center ml-4'>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />
            <label
                htmlFor="file-upload"
                className="cursor-pointer bg-black text-white px-4 py-2 rounded-md"
            >
                Choose file
            </label>
            
            
        </div>

        
        <div className='flex flex-col justify-center ml-3'>  
            <div> 
                </div> 
                {fileName && (
                    <span className="text-gray-300 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap w-48">
                        {fileName}
                    </span>
                )}
            </div>
        
        
        </div>
      <p className="text-gray-400 text-sm">
        Most meme coins use a square 1000x1000 logo
      </p>
    </div>
  );
};

export default FileUpload;
