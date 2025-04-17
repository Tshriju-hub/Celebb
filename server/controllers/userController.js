const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try{
    const users = await User.find().select('-password');
    res.status(200).json(users);
  }
  catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('profile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, email },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = { getUserDetails, getProfile, updateProfile, deleteAccount, getAllUsers };
