import React, { useState } from 'react';
import { FaUpload, FaImage, FaFilePdf, FaQrcode, FaTimes } from 'react-icons/fa';

const DocumentUpload = ({ handleImageUpload, handleFileUpload, formData }) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState('');

  // Cloudinary size limits
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
  const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB for PDFs

  const validateFileSize = (file, type) => {
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_PDF_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`${file.name} exceeds the maximum size limit of ${maxSizeMB}MB for ${type} files`);
      return false;
    }
    return true;
  };

  const handleHallImagesChange = (e) => {
    const files = Array.from(e.target.files);
    handleImageUpload(e);

    // Create preview URLs for the images
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    // You'll need to implement the logic to remove the file from formData as well
  };

  const handleFileUploadWithValidation = (e, field) => {
    setError('');
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => validateFileSize(file, 'pdf'));
    
    if (validFiles.length > 0) {
      handleFileUpload({ target: { files: validFiles } }, field);
    }
  };

  return (
    <div className="bg-gray-50 p-8 rounded-xl space-y-8">
      <h3 className="text-2xl font-semibold text-[#6D0C0E] mb-6">Upload Required Documents</h3>

      {/* Hall Images Upload */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Hall Images</h4>
        <p className="text-gray-600 mb-4">Upload multiple images of your venue halls (Max size: 10MB per image)</p>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6D0C0E] transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleHallImagesChange}
              className="hidden"
              id="hallImages"
            />
            <label
              htmlFor="hallImages"
              className="cursor-pointer flex flex-col items-center"
            >
              <FaImage className="text-4xl text-[#6D0C0E] mb-2" />
              <span className="text-gray-600">Click to upload hall images</span>
              <span className="text-sm text-gray-500">or drag and drop</span>
            </label>
          </div>

          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="mt-4">
              <h5 className="text-lg font-medium text-gray-700 mb-3">Uploaded Images:</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Hall image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Company Registration Document */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Company Registration Document</h4>
        <p className="text-gray-600 mb-4">Upload your company registration document (PDF, Max size: 100MB)</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6D0C0E] transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileUploadWithValidation(e, 'companyRegistration')}
            className="hidden"
            id="companyRegistration"
          />
          <label
            htmlFor="companyRegistration"
            className="cursor-pointer flex flex-col items-center"
          >
            <FaFilePdf className="text-4xl text-[#6D0C0E] mb-2" />
            <span className="text-gray-600">Click to upload registration document</span>
            <span className="text-sm text-gray-500">or drag and drop</span>
          </label>
        </div>
        {formData.companyRegistration.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Attached files:</p>
            <ul className="mt-2 space-y-2">
              {formData.companyRegistration.map((file, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <FaFilePdf className="mr-2 text-[#6D0C0E]" />
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Owner Citizenship Document */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Owner Citizenship Document</h4>
        <p className="text-gray-600 mb-4">Upload your citizenship document (PDF, Max size: 100MB)</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6D0C0E] transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileUploadWithValidation(e, 'ownerCitizenship')}
            className="hidden"
            id="ownerCitizenship"
          />
          <label
            htmlFor="ownerCitizenship"
            className="cursor-pointer flex flex-col items-center"
          >
            <FaFilePdf className="text-4xl text-[#6D0C0E] mb-2" />
            <span className="text-gray-600">Click to upload citizenship document</span>
            <span className="text-sm text-gray-500">or drag and drop</span>
          </label>
        </div>
        {formData.ownerCitizenship.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Attached files:</p>
            <ul className="mt-2 space-y-2">
              {formData.ownerCitizenship.map((file, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <FaFilePdf className="mr-2 text-[#6D0C0E]" />
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">QR Code</h4>
        <p className="text-gray-600 mb-4">Upload your QR code image (Max size: 10MB)</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6D0C0E] transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUploadWithValidation(e, 'qrCode')}
            className="hidden"
            id="qrCode"
          />
          <label
            htmlFor="qrCode"
            className="cursor-pointer flex flex-col items-center"
          >
            <FaQrcode className="text-4xl text-[#6D0C0E] mb-2" />
            <span className="text-gray-600">Click to upload QR code</span>
            <span className="text-sm text-gray-500">or drag and drop</span>
          </label>
        </div>
        {formData.qrCode.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Attached files:</p>
            <ul className="mt-2 space-y-2">
              {formData.qrCode.map((file, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <FaImage className="mr-2 text-[#6D0C0E]" />
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload; 