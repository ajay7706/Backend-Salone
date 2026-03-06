const cloudinary = require('../config/cloudinaryConfig');

/**
 * Upload a PDF or other raw file to Cloudinary.
 * @param {string} filePath - Local path to the file to upload.
 * @returns {Promise<string>} secure_url of the uploaded file
 */
exports.uploadPDF = async (filePath) => {
  if (!filePath) {
    throw new Error('No file path provided to uploadPDF');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder: 'salon-receipts',
  });

  // cloudinary returns lots of info; we only care about secure_url
  return result.secure_url;
};
