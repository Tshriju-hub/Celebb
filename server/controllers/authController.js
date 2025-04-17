const User = require('../models/User');
const Registration = require('../models/Registration'); // Import the Registration model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');

dotenv.config();

const SALT_ROUNDS = 10; // Define a constant for salt rounds

// Set up multer for file uploads
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Set upload limits and file type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only JPEG, JPG, and PNG files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter
});


// User Registration
const register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, role } = req.body;
    const hallImages = req.files ? req.files.map(file => file.filename) : [];

    // Input Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check for existing user
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists',
        field: 'email'
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists',
        field: 'username'
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password.trim(), SALT_ROUNDS);
    console.log('Hashed password:', hashedPassword); // Log the hashed password for debugging
    let status = 'pending'; // Default status for all users
    console.log('User role:', role); // Log the user role for debugging
    if(role == null){
      status = 'approved'; // Set status to approved for regular users
    }
    // Create new user
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password: password.trim(),
      role: role || 'user',
      status,
      hallImages
    });

    await user.save();

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      success: true,
      userId: user._id,
      token,
      role: user.role,
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    console.log('Registration data:', { firstName, lastName, username, email, password });

    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// User Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Incoming login request body:', req.body); // Log the incoming request body
    console.log('Login request body:', req.body); // Log the incoming request body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required'
      });
    }

    console.log('Login attempt for:', email); // Log the email for debugging

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    console.log('User found:', user ? user : 'No user found');

    if (!user || !user.password) { 
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials',
        field: 'email'
      });
    }

    // Compare hashed password
    const trimmedPassword = password.trim();
     console.log('Login attempt - input password:', trimmedPassword);
     console.log('Stored hash:', user.password);
     const isMatch = await bcrypt.compare(trimmedPassword, user.password);
     console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials',
        field: 'password'
      });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      return res.status(400).json({ 
        success: false,
        message: 'Wait for admin approval',
        field: 'status'
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      success: true,
      userId: user._id,
      token,
      role: user.role,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Google Sign-In
const googleSignIn = async (req, res) => {
  const { idToken } = req.body; // Get the ID token from the request body

  // Verify the ID token with Google
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  const { email, given_name, family_name, sub, picture } = payload; // Extract user info from the payload

  // Check if the user already exists
  let user = await User.findOne({ email });

  if (!user) {
    // If the user does not exist, create a new user
    user = new User({
      firstName: given_name,
      lastName: family_name,
      email,
      googleId: sub,
      provider: 'google',
      avatar: picture,
    });
    await user.save();
  }

  // Generate JWT Token
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(200).json({ 
    success: true,
    userId: user._id,
    token,
    role: user.role,
    message: 'Google sign-in successful' 
  });
};

// Get User Details
const getUserDetails = async (req, res) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader); // Log the authorization header for debugging
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided or invalid format" 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token); // Log the token for debugging
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: "Token expired" 
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.userId || decoded.id)
      .select('-password -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Format comprehensive user data response
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      image: user.avatar || null,  // Add image field for frontend compatibility
      avatar: user.avatar,         // Keep original field for backward compatibility
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...(user.role === 'owner' && {
        venueDetails: {
          venueName: user.venueName,
          venueAddress: user.venueAddress,
          venuePhone: user.venuePhone,
          hallImages: user.hallImages
        }
      })
    };

    res.status(200).json({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Authentication middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};

// Owner role verification middleware
const owner = (req, res, next) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized, owner access required'
    });
  }
  next();
};

const approveUser = async (req, res) => {
  try {
    console.log('Incoming request body for user approval:', req.body); // Log the incoming request body
    const { userId } = req.body; // Get userId from request body
    const  user = await User.findById(userId); // Find user by ID
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'approved' },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message:'User approved successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error approving user:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided or invalid format" 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the existing token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }

    // Find the user
    const user = await User.findById(decoded.userId || decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to refresh token" 
    });
  }
};

// Export functions
module.exports = { 
  register, 
  login, 
  googleSignIn, 
  upload, 
  getUserDetails,
  protect,
  approveUser,
  owner,
  refreshToken
};
