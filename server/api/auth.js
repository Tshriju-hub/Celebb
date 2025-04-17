import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }

  try {
    await client.connect();
    const db = client.db('CelebrationStation');
    const users = db.collection('users');

    // Extract the registration fields from the request body
    const { email, name, image, ownerName, ownerEmail, ownerPhone } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email and name',
      });
    }

    // Check if the user already exists for normal registration
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        field: 'email',
      });
    }

    // Check if the owner email already exists
    const existingOwner = await users.findOne({ ownerEmail });
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'Owner email already exists',
        field: 'ownerEmail',
      });
    }

    // Create new user
    const userResult = await users.insertOne({
      name,
      email,
      image: image || '',
      createdAt: new Date(),
    });

    if (!userResult.acknowledged) {
      throw new Error('Failed to create user');
    }

    // Create new owner registration
    const ownerResult = await users.insertOne({
      ownerName,
      ownerEmail,
      ownerPhone,
      createdAt: new Date(),
    });

    if (!ownerResult.acknowledged) {
      throw new Error('Failed to create owner');
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User and owner registered successfully',
    });
  } catch (error) {
    console.error('Error in registration API:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  } finally {
    await client.close();
  }
}
