const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // For serving uploaded files

// Connect to MongoDB
mongoose.connect('mongodb+srv://Thawatchai_Admin:p3nudcP1HBJdfEko@srss.alag1un.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection failed:', err));

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  walletBalance: { type: Number, default: 0 }, // เพิ่มฟิลด์ walletBalance
});

// User model
const User = mongoose.model('User', userSchema);

// Space schema
const spaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  advertisingWords: { type: String, required: true },
  address: { type: String, required: true },
  types: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

// Space model
const Space = mongoose.model('Space', spaceSchema);

// Booking schema
const bookingSchema = new mongoose.Schema({
  spaceId: String,
  userId: String,
  date: String,
  time: String,
});

// Booking model
const Booking = mongoose.model('Booking', bookingSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set new file name
  }
});

const upload = multer({ storage });

// Route for user registration
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

// Route for user login
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
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for saving a new space
app.post('/api/manage-space', upload.single('image'), async (req, res) => {
  try {
    const { name, advertisingWords, address, types, size, price } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const image = req.file.filename; // Use the uploaded file name

    const newSpace = new Space({
      name,
      advertisingWords,
      address,
      types,
      size,
      price,
      image,
    });

    await newSpace.save();
    res.status(201).json({ success: true, message: 'Space saved successfully!' });
  } catch (error) {
    console.error('Error saving space:', error);
    res.status(500).json({ success: false, message: 'Error saving space', error: error.message });
  }
});

// Route for fetching all spaces
app.get('/api/spaces', async (req, res) => {
  try {
    const spaces = await Space.find(); // Fetch all spaces from MongoDB
    res.status(200).json(spaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({ success: false, message: 'Error fetching spaces', error: error.message });
  }
});

// Route for booking a space
app.post('/api/reserve', async (req, res) => {
  const { spaceId, userId, date, time } = req.body;

  if (!spaceId || !userId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Check if there is already a booking for the same time slot
    const existingBooking = await Booking.findOne({ spaceId, date, time });
    if (existingBooking) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    // Create a new booking
    const newBooking = new Booking({
      spaceId,
      userId,
      date,
      time,
    });

    await newBooking.save();
    res.status(201).json({ success: true, message: 'Booking saved successfully!' });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ success: false, message: 'Error saving booking', error: error.message });
  }
});

// Route for fetching user bookings
app.get('/api/user-bookings/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await Booking.find({ userId });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching user bookings', error: error.message });
  }
});

// Wallet routes
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('ไม่พบผู้ใช้งาน');
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/api/wallet/:userId', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send('ไม่พบผู้ใช้งาน');

    // Update wallet balance
    user.walletBalance += amount;
    await user.save();
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

// Route for booking a space
app.post('/api/reserve', async (req, res) => {
  const { spaceId, userId, date, time } = req.body;

  // Log input data to see if they are received correctly
  console.log('spaceId:', spaceId, 'userId:', userId, 'date:', date, 'time:', time);

  // Check for missing fields
  if (!spaceId || !userId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Check if there is already a booking for the same time slot
    const existingBooking = await Booking.findOne({ spaceId, date, time });
    
    // Log the result of booking check
    console.log('Existing Booking:', existingBooking);

    if (existingBooking) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    // Create a new booking
    const newBooking = new Booking({
      spaceId,
      userId,
      date,
      time,
    });

    await newBooking.save();
    res.status(201).json({ success: true, message: 'Booking saved successfully!' });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ success: false, message: 'Error saving booking', error: error.message });
  }
});

// Route for booking a space
app.post('/api/reserve', async (req, res) => {
  const { spaceId, userId, date, time } = req.body;

  // Log ข้อมูลที่ส่งมาจาก Frontend
  console.log('Received from Frontend:', { spaceId, userId, date, time });

  if (!spaceId || !userId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // ตรวจสอบว่ามีการจองในเวลาเดียวกันหรือไม่
    const existingBooking = await Booking.findOne({ spaceId, date, time });
    if (existingBooking) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    // ถ้าไม่มีการจองซ้ำ สร้างการจองใหม่
    const newBooking = new Booking({
      spaceId,
      userId,
      date,
      time,
    });

    await newBooking.save(); // บันทึกข้อมูลลง MongoDB

    // Log ข้อมูลการจองที่บันทึก
    console.log('Booking saved:', newBooking);

    res.status(201).json({ success: true, message: 'Booking saved successfully!' });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ success: false, message: 'Error saving booking', error: error.message });
  }

  const reservationRoutes = require('./routes/reservationRoutes');
  app.use('/api/reservations', reservationRoutes);

});

