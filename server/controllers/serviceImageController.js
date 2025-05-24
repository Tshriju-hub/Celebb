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
        if (error) {
          console.error('Cloudinary upload error details:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload success:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );

    bufferStream.pipe(uploadStream);
  });
};

// Upload service image
const uploadServiceImage = async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileType: req.file?.mimetype,
      fileSize: req.file?.size,
      category: req.body?.category,
      userId: req.user?.id
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    let imageUrl;
    try {
      console.log('Attempting to upload to Cloudinary...');
      imageUrl = await uploadToCloudinary(req.file.buffer);
      console.log('Successfully uploaded to Cloudinary:', imageUrl);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ message: 'Failed to upload image to cloud storage' });
    }

    console.log('Creating new ServiceImage document...');
    const serviceImage = new ServiceImage({
      imageUrl,
      category,
      owner: req.user.id
    });

    await serviceImage.save();
    console.log('ServiceImage saved successfully:', serviceImage._id);
    res.status(201).json(serviceImage);
  } catch (error) {
    console.error('Service image upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Failed to process image upload' });
  }
};

// Get service images by category
const getServiceImages = async (req, res) => {
  try {
    console.log('Get images request received:', {
      category: req.query.category,
      userId: req.user?.id,
      userRole: req.user?.role
    });

    const { category } = req.query;
    const query = category ? { category } : {};
    
    if (req.user && req.user.role === 'owner') {
      query.owner = req.user.id;
    }

    const images = await ServiceImage.find(query).sort({ createdAt: -1 });
    console.log(`Found ${images.length} images`);
    res.json(images);
  } catch (error) {
    console.error('Get images error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: error.message });
  }
};

// Delete service image
const deleteServiceImage = async (req, res) => {
  try {
    console.log('Delete image request received:', {
      imageId: req.params.id,
      userId: req.user?.id
    });

    const image = await ServiceImage.findById(req.params.id);
    
    if (!image) {
      console.log('Image not found:', req.params.id);
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check if the user owns this image
    if (image.owner.toString() !== req.user.id) {
      console.log('Unauthorized delete attempt:', {
        imageOwner: image.owner,
        requestUser: req.user.id
      });
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }

    await ServiceImage.findByIdAndDelete(req.params.id);
    console.log('Image deleted successfully:', req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadServiceImage,
  getServiceImages,
  deleteServiceImage
}; 
