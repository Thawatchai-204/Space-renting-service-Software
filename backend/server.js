const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Import Routes ที่แยกไว้
const { User, Transaction } = require('./models/User'); // Import Model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://Thawatchai_Admin:p3nudcP1HBJdfEko@srss.alag1un.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('MongoDB connection failed:', err));

// Space schema
const spaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  advertisingWords: { type: String, required: true },
  address: { type: String, required: true },
  types: { type: String, required: true },
  size: { type: String, required: true },
  pricePerHour: { type: Number, default: 0 },
  pricePerDay: { type: Number, default: 0 },
  pricePerWeek: { type: Number, default: 0 },
  pricePerMonth: { type: Number, default: 0 },
  image: { type: String, required: true },
});

const Space = mongoose.model('Space', spaceSchema);

// Booking schema
const bookingSchema = new mongoose.Schema({
  spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalPrice: { type: Number, required: true },
});

const Booking = mongoose.model('Booking', bookingSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// User registration
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'p3nudcP1HBJdfEko', { expiresIn: '1h' });

    res.json({ token, userId: user._id, username: email });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Saving a new space
app.post('/api/manage-space', upload.single('image'), async (req, res) => {
  try {
    const { name, advertisingWords, address, types, size, pricePerHour, pricePerDay, pricePerWeek, pricePerMonth } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const newSpace = new Space({
      name,
      advertisingWords,
      address,
      types,
      size,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      image: req.file.filename,
    });

    await newSpace.save();
    res.status(201).json({ success: true, message: 'Space saved successfully!' });
  } catch (error) {
    console.error('Error saving space:', error);
    res.status(500).json({ success: false, message: 'Error saving space', error: error.message });
  }
});

// Fetching all spaces
app.get('/api/spaces', async (req, res) => {
  try {
    const spaces = await Space.find();
    res.status(200).json(spaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({ success: false, message: 'Error fetching spaces', error: error.message });
  }
});

// Booking a space
app.post('/api/reserve', async (req, res) => {
  const { spaceId, userId, startDate, endDate, startTime, endTime, totalPrice } = req.body;

  if (!spaceId || !userId || !startDate || !endDate || !startTime || !endTime || !totalPrice) {
    console.error('Missing required fields:', req.body);
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const existingBooking = await Booking.findOne({ spaceId, startDate, endDate, startTime, endTime });

    if (existingBooking) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    const newBooking = new Booking({
      spaceId,
      userId,
      startDate,
      endDate,
      startTime,
      endTime,
      totalPrice,
    });

    await newBooking.save();
    res.status(201).json({ success: true, message: 'Booking saved successfully!' });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ success: false, message: 'Error saving booking', error: error.message });
  }
});

// Wallet routes
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ balance: user.walletBalance });
  } catch (err) {
    console.error('Error fetching wallet balance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/wallet/:userId', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance += amount;
    await user.save();
    res.json({ balance: user.walletBalance });
  } catch (err) {
    console.error('Error updating wallet balance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
