const ServiceImage = require('../models/ServiceImage');
const cloudinary = require('../lib/cloudinary');
const stream = require('stream');

// Helper to upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    bufferStream.pipe(uploadStream);
  });
};

// Upload service image
const uploadServiceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);

    const serviceImage = new ServiceImage({
      imageUrl,
      category,
      owner: req.user.id
    });

    await serviceImage.save();
    res.status(201).json(serviceImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service images by category
const getServiceImages = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    
    if (req.user && req.user.role === 'owner') {
      query.owner = req.user.id;
    }

    const images = await ServiceImage.find(query).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete service image
const deleteServiceImage = async (req, res) => {
  try {
    const image = await ServiceImage.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check if the user owns this image
    if (image.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }

    await ServiceImage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadServiceImage,
  getServiceImages,
  deleteServiceImage
}; 
