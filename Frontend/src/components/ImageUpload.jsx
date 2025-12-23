import React, { useState, useRef } from "react";
import { FaImage, FaTimes } from "react-icons/fa";

const ImageUpload = ({
  label = "Image",
  onImageChange,
  previewImage = null,
  className = "",
  required = false,
  maxSize = 5, // in MB
  error: externalError = "", // Error from react-hook-form or parent
}) => {
  const [frontendImage, setFrontendImage] = useState(previewImage);
  const [internalError, setInternalError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Use external error if provided, otherwise use internal error
  const error = externalError || internalError;

  const validateFile = (file) => {
    // Check if file exists
    if (!file) {
      return false;
    }

    // Check file type
    if (!file.type || !file.type.startsWith("image/")) {
      setInternalError("Please upload a valid image file (PNG, JPG, GIF, etc.)");
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setInternalError(`File size must be less than ${maxSize}MB. Current size: ${fileSizeMB.toFixed(2)}MB`);
      return false;
    }

    return true;
  };

  const processFile = (file) => {
    if (file) {
      // Validate file before processing
      if (validateFile(file)) {
        // Clear any previous errors
        setInternalError("");
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        setFrontendImage(objectUrl);
        if (onImageChange) {
          onImageChange(file);
        }
      } else {
        // Clear the input and previous image if validation fails
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Don't clear frontendImage here - let it show the previous valid image
      }
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're actually leaving the drop zone
    // Check if we're leaving the main container, not just a child element
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleRemoveImage = () => {
    setFrontendImage(null);
    setInternalError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onImageChange) {
      onImageChange(null);
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
          error
            ? "border-red-300 bg-red-50"
            : isDragging
            ? "border-[#ff4d2d] bg-orange-50"
            : "border-gray-300 bg-gray-50 hover:bg-orange-50 hover:border-[#ff4d2d]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
          <FaImage
            className={`w-8 h-8 mb-2 transition-colors ${
              isDragging ? "text-[#ff4d2d]" : "text-gray-400"
            }`}
          />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold text-[#ff4d2d]">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. {maxSize}MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/*"
          className="hidden"
          onChange={handleImage}
        />
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <FaTimes className="text-xs" />
            {error}
          </p>
        </div>
      )}
      {frontendImage && (
        <div className="mt-4 relative group">
          <img 
            src={frontendImage} 
            alt="previewImage" 
            className="w-full h-48 object-cover rounded-lg border relative z-0"
            onError={(e) => {
              setError("Failed to load image preview");
            }}
          />
          <div className="absolute inset-0 rounded-lg transition-all duration-200 flex items-center justify-center z-10 group-hover:bg-black/30 pointer-events-none group-hover:pointer-events-auto">
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <button
                type="button"
                onClick={handleChangeImage}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-md"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors shadow-md flex items-center gap-1"
              >
                <FaTimes className="text-xs" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
