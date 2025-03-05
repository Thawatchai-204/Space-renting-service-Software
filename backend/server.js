const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { User, Transaction } = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'p3nudcP1HBJdfEko'; // คีย์ลับสำหรับ JWT

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://Thawatchai_Admin:p3nudcP1HBJdfEko@srss.alag1un.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((err) => console.error('MongoDB connection failed:', err));

// Space Schema
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
    images: [{ type: String, required: true }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    // ลบ ownerId เพราะใช้ userId แทนตามโครงสร้างข้อมูล
});
const Space = mongoose.model('Space', spaceSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'completed', 'cancelled'] }
});
const Booking = mongoose.model('Booking', bookingSchema);

// Request Schema (สำหรับเก็บ request ID เพื่อป้องกันซ้ำ)
const requestSchema = new mongoose.Schema({
    requestId: { type: String, unique: true, required: true }
});
const Request = mongoose.model('Request', requestSchema);

// Multer configuration for space images, profile images, and ID card images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, GIF allowed!'), false);
        }
    },
});

// Multer configuration for payment proof
const proofStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads/proofs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const uploadProof = multer({
    storage: proofStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG files are allowed'), false);
        }
    },
}).single('paymentProof');

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// User Registration
app.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, role: role || 'user', walletBalance: 0 });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// User Login
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

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({
            token,
            userId: user._id,
            username: user.username || email,
            role: user.role || 'user'
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password
app.post('/api/change-password', authenticateToken, async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in change-password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Account
app.post('/api/delete-account', authenticateToken, async (req, res) => {
    try {
        const { userId, email, password } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.email !== email) return res.status(400).json({ message: 'Email is incorrect' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password is incorrect' });

        await User.findByIdAndDelete(userId);
        await Booking.deleteMany({ userId });
        
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error in delete-account:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Saving a New Space
app.post('/api/manage-space', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { userId, name, advertisingWords, address, types, size, pricePerHour, pricePerDay, pricePerWeek, pricePerMonth } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }
        if (!userId || !name || !advertisingWords || !address || !types || !size) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const imageFiles = req.files.map(file => file.filename);

        const newSpace = new Space({
            userId,
            name,
            advertisingWords,
            address,
            types,
            size,
            pricePerHour: parseFloat(pricePerHour) || 0,
            pricePerDay: parseFloat(pricePerDay) || 0,
            pricePerWeek: parseFloat(pricePerWeek) || 0,
            pricePerMonth: parseFloat(pricePerMonth) || 0,
            images: imageFiles,
        });

        await newSpace.save();
        res.status(201).json({ success: true, message: 'Space saved successfully!' });
    } catch (error) {
        console.error('Error saving space:', error);
        res.status(500).json({ success: false, message: 'Error saving space', error: error.message });
    }
});

// Fetching All Spaces
app.get('/api/spaces', async (req, res) => {
    try {
        const spaces = await Space.find();
        res.status(200).json(spaces);
    } catch (error) {
        console.error('Error fetching spaces:', error);
        res.status(500).json({ success: false, message: 'Error fetching spaces', error: error.message });
    }
});

// Fetching Reservations by userId
app.get('/api/reservations/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const bookings = await Booking.find({ userId })
            .populate('spaceId', 'name advertisingWords address types size pricePerHour images')
            .sort({ startDate: 1 });

        if (!bookings || bookings.length === 0) {
            return res.status(200).json([]);
        }

        const formattedBookings = bookings.map(booking => ({
            _id: booking._id,
            spaceName: booking.spaceId ? booking.spaceId.name : 'Unknown Space',
            startDate: booking.startDate,
            endDate: booking.endDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            totalPrice: booking.totalPrice,
            address: booking.spaceId ? booking.spaceId.address : 'N/A',
            types: booking.spaceId ? booking.spaceId.types : 'N/A',
            size: booking.spaceId ? booking.spaceId.size : 'N/A',
            image: booking.spaceId && booking.spaceId.images.length > 0 ? booking.spaceId.images[0] : null,
        }));

        res.status(200).json(formattedBookings);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Error fetching reservations', error: error.message });
    }
});

// Booking a Space (แก้ไขเพื่อหักเงินครั้งเดียวและป้องกัน "Wallet update" ซ้ำ)
app.post('/api/reserve', authenticateToken, async (req, res) => {
    const requestId = req.headers['x-request-id'];
    if (!requestId) {
        return res.status(400).json({ message: 'Missing request ID' });
    }

    const existingRequest = await Request.findOne({ requestId });
    if (existingRequest) {
        return res.status(409).json({ message: 'Request already processed' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { spaceId, userId, startDate, endDate, startTime, endTime, totalPrice } = req.body;

        if (!spaceId || !userId || !startDate || !endDate || !startTime || !endTime || totalPrice === undefined) {
            console.error('Missing required fields:', req.body);
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const existingBooking = await Booking.findOne({
            spaceId,
            $or: [
                {
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate },
                    startTime: { $lte: endTime },
                    endTime: { $gte: startTime }
                }
            ]
        }).session(session);

        if (existingBooking) {
            throw new Error('This time slot is already booked');
        }

        const user = await User.findById(userId).session(session);
        if (!user) throw new Error('User not found');
        if (user.walletBalance < totalPrice) {
            throw new Error('Insufficient wallet balance');
        }

        const newBooking = new Booking({
            spaceId,
            userId,
            startDate,
            endDate,
            startTime,
            endTime,
            totalPrice: parseFloat(totalPrice),
        });

        // หักเงินจากผู้จองครั้งเดียว (บันทึกเป็น "Booking payment for space...")
        user.walletBalance -= parseFloat(totalPrice);
        const transaction = new Transaction({
            userId,
            description: `Booking payment for space ${spaceId}`,
            amount: -parseFloat(totalPrice),
            type: 'withdrawal',
            status: 'completed'
        });

        // เพิ่มเงินให้เจ้าของพื้นที่
        const space = await Space.findById(spaceId).session(session);
        const ownerId = space.userId;
        if (!ownerId) throw new Error('Owner ID not found');
        const owner = await User.findById(ownerId).session(session);
        if (!owner) throw new Error('Owner not found');
        owner.walletBalance += parseFloat(totalPrice);
        const ownerTransaction = new Transaction({
            userId: ownerId,
            description: `Received payment for space ${spaceId}`,
            amount: parseFloat(totalPrice),
            type: 'deposit',
            status: 'completed'
        });

        await Promise.all([
            newBooking.save({ session }),
            user.save({ session }),
            transaction.save({ session }),
            owner.save({ session }),
            ownerTransaction.save({ session })
        ]);

        await session.commitTransaction();
        await Request.create({ requestId });
        res.json({ success: true, message: 'Booking saved successfully!' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message || 'Failed to reserve space' });
    } finally {
        session.endSession();
    }
});

// Delete Reservation
app.delete('/api/reservations/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }
        res.status(200).json({ success: true, message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ success: false, message: 'Error deleting reservation', error: error.message });
    }
});

// Check Availability
app.post('/api/check-availability', async (req, res) => {
    const { spaceId, startDate, endDate, startTime, endTime } = req.body;

    if (!spaceId || !startDate || !endDate || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const bookings = await Booking.find({ spaceId });
        const newStart = new Date(`${startDate}T${startTime}`);
        const newEnd = new Date(`${endDate}T${endTime}`);

        const isAvailable = bookings.every(booking => {
            const existingStart = new Date(`${booking.startDate}T${booking.startTime}`);
            const existingEnd = new Date(`${booking.endDate}T${booking.endTime}`);
            return newEnd <= existingStart || newStart >= existingEnd;
        });

        res.status(200).json({ available: isAvailable });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ available: false, message: 'Error checking availability', error: error.message });
    }
});

// Wallet Routes
app.get('/api/wallet/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            balance: user.walletBalance || 0,
            transactions: transactions.map(transaction => ({
                id: transaction._id,
                createdAt: transaction.createdAt,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                status: transaction.status
            })),
        });
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch wallet data' });
    }
});

// Deposit to Wallet
app.post('/api/wallet/deposit/:userId', authenticateToken, uploadProof, async (req, res) => {
    const { userId } = req.params;
    const { amount } = req.body;
    const paymentProof = req.file ? req.file.filename : null;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const transaction = new Transaction({
            userId,
            description: 'Deposit via payment',
            amount: parseFloat(amount),
            type: 'deposit',
            status: 'pending',
            paymentProof: paymentProof ? `/uploads/proofs/${paymentProof}` : null
        });

        await transaction.save();

        res.json({ 
            success: true, 
            balance: user.walletBalance,
            transactionId: transaction._id
        });
    } catch (error) {
        console.error('Error depositing to wallet:', error);
        res.status(500).json({ success: false, message: 'Failed to deposit to wallet' });
    }
});

// Withdraw from Wallet
app.post('/api/wallet/withdraw/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        const transaction = new Transaction({
            userId,
            description: reason || 'Withdrawal',
            amount: -parseFloat(amount),
            type: 'withdrawal',
            status: 'completed'
        });

        user.walletBalance -= parseFloat(amount);
        await Promise.all([user.save(), transaction.save()]);

        res.json({ 
            success: true, 
            balance: user.walletBalance,
            transactionId: transaction._id
        });
    } catch (error) {
        console.error('Error withdrawing from wallet:', error);
        res.status(500).json({ success: false, message: 'Failed to withdraw from wallet' });
    }
});

// Update Wallet Balance (สำหรับระบบภายใน ไม่ควรให้ frontend เรียกโดยตรง)
app.put('/api/wallet/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { amount, description } = req.body;
    const requestId = req.headers['x-request-id'];

    if (!requestId) {
        return res.status(400).json({ message: 'Missing request ID' });
    }

    const existingRequest = await Request.findOne({ requestId });
    if (existingRequest) {
        return res.status(409).json({ message: 'Request already processed' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newBalance = user.walletBalance + parseFloat(amount);
        if (newBalance < 0) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        const transaction = new Transaction({
            userId,
            description: description || 'System wallet update',
            amount: parseFloat(amount),
            type: amount > 0 ? 'deposit' : 'withdrawal',
            status: 'completed'
        });

        user.walletBalance = newBalance;
        await Promise.all([user.save(), transaction.save()]);
        await Request.create({ requestId });
        res.json({ success: true, balance: user.walletBalance });
    } catch (error) {
        console.error('Error updating wallet balance:', error);
        res.status(500).json({ success: false, message: 'Failed to update wallet balance' });
    }
});

// QR Code Route
app.get('/api/qrcode', authenticateToken, (req, res) => {
    try {
        const qrCodePath = path.join(__dirname, 'uploads', 'admin_qr_code.jpg');
        if (!fs.existsSync(qrCodePath)) {
            return res.status(404).json({ error: 'QR code file not found' });
        }
        res.sendFile(qrCodePath);
    } catch (error) {
        console.error('Error sending QR code:', error);
        res.status(500).json({ error: 'Failed to send QR code' });
    }
});

// GET User Profile
app.get('/api/user/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Profile
app.put('/api/user/:userId', authenticateToken, upload.fields([{ name: 'profileImage' }, { name: 'idCardImage' }]), async (req, res) => {
    try {
        const { username, email, phone, address, facebook, line, confirmPassword } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(confirmPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        const updateData = { username, email, phone, address, facebook, line };
        if (req.files && req.files.profileImage) {
            updateData.profileImage = req.files.profileImage[0].filename;
        }
        if (req.files && req.files.idCardImage) {
            updateData.idCardImage = req.files.idCardImage[0].filename;
            updateData.idCardStatus = 'pending';
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.userId, updateData, { new: true });
        res.json({ 
            success: true, 
            profileImage: updatedUser.profileImage, 
            idCardImage: updatedUser.idCardImage, 
            idCardStatus: updatedUser.idCardStatus 
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE Space Endpoint
app.delete('/api/spaces/:spaceId', authenticateToken, async (req, res) => {
    try {
        const { spaceId } = req.params;
        const userId = req.user.userId;

        if (!spaceId) {
            return res.status(400).json({ message: 'Space ID is required' });
        }

        const space = await Space.findById(spaceId);
        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }

        const user = await User.findById(userId);
        if (space.userId.toString() !== userId && user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this space' });
        }

        await Promise.all([
            Space.findByIdAndDelete(spaceId),
            Booking.deleteMany({ spaceId })
        ]);

        res.status(200).json({ message: 'Space deleted successfully' });
    } catch (error) {
        console.error('Error deleting space:', error);
        res.status(500).json({ message: 'Failed to delete space', error: error.message });
    }
});

// Update a Space
app.put('/api/spaces/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const space = await Space.findById(id);
        if (!space) {
            return res.status(404).json({ success: false, message: 'Space not found' });
        }
        if (space.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this space' });
        }

        const { name, advertisingWords, address, types, size, pricePerHour, pricePerDay, pricePerWeek, pricePerMonth } = req.body;
        const updateData = {
            name,
            advertisingWords,
            address,
            types,
            size,
            pricePerHour: parseFloat(pricePerHour) || 0,
            pricePerDay: parseFloat(pricePerDay) || 0,
            pricePerWeek: parseFloat(pricePerWeek) || 0,
            pricePerMonth: parseFloat(pricePerMonth) || 0,
        };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.filename);
        }

        const updatedSpace = await Space.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, message: 'Space updated successfully', space: updatedSpace });
    } catch (error) {
        console.error('Error updating space:', error);
        res.status(500).json({ success: false, message: 'Error updating space', error: error.message });
    }
});

// Fetch Reservations for Admin
app.get('/api/reservations/admin/:spaceId', authenticateToken, async (req, res) => {
    const { spaceId } = req.params;

    try {
        const bookings = await Booking.find({ spaceId });
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found' });
        }
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// Admin Routes for Statistics
app.get('/api/users/count', authenticateAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        res.json({ totalUsers });
    } catch (error) {
        console.error('Error fetching user count:', error);
        res.status(500).json({ message: 'Error fetching user count', error: error.message });
    }
});

app.get('/api/transactions/total-money', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find();
        const totalMoney = users.reduce((sum, user) => sum + (user.walletBalance || 0), 0);
        res.json({ totalMoney });
    } catch (error) {
        console.error('Error fetching total money:', error);
        res.status(500).json({ message: 'Error fetching total money', error: error.message });
    }
});

app.get('/api/bookings/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const bookings = await Booking.find();
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        res.json({
            totalBookings,
            pendingBookings,
            completedBookings,
            cancelledBookings,
            totalRevenue,
            avgBookingValue
        });
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({ message: 'Error fetching booking stats', error: error.message });
    }
});

app.get('/api/spaces/count', authenticateAdmin, async (req, res) => {
    try {
        const totalSpaces = await Space.countDocuments();
        res.json({ totalSpaces });
    } catch (error) {
        console.error('Error fetching space count:', error);
        res.status(500).json({ message: 'Error fetching space count', error: error.message });
    }
});

app.get('/api/users/top', authenticateAdmin, async (req, res) => {
    try {
        const topUsers = await Booking.aggregate([
            { $group: { _id: '$userId', bookingCount: { $sum: 1 } } },
            { $sort: { bookingCount: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { _id: 1, username: '$user.username', bookingCount: 1 } }
        ]);
        res.json(topUsers);
    } catch (error) {
        console.error('Error fetching top users:', error);
        res.status(500).json({ message: 'Error fetching top users', error: error.message });
    }
});

app.get('/api/spaces/top', authenticateAdmin, async (req, res) => {
    try {
        const topSpaces = await Booking.aggregate([
            { $group: { _id: '$spaceId', bookingCount: { $sum: 1 } } },
            { $sort: { bookingCount: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'spaces', localField: '_id', foreignField: '_id', as: 'space' } },
            { $unwind: '$space' },
            { $project: { _id: 1, name: '$space.name', bookingCount: 1 } }
        ]);
        res.json(topSpaces);
    } catch (error) {
        console.error('Error fetching top spaces:', error);
        res.status(500).json({ message: 'Error fetching top spaces', error: error.message });
    }
});

// Fetch All Users (Admin Only)
app.get('/api/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Approve User ID Card (Admin Only)
app.put('/api/user/:userId/approve', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { idCardStatus: 'approved' },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User approved successfully', user: updatedUser });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: 'Failed to approve user', error: error.message });
    }
});

// Fetch Pending Requests (Admin Only)
app.get('/api/requests/pending', authenticateAdmin, async (req, res) => {
    try {
        const pendingTransactions = await Transaction.find({ 
            type: 'deposit', 
            status: 'pending' 
        }).populate('userId', 'username email');

        const formattedRequests = pendingTransactions.map(transaction => ({
            _id: transaction._id,
            username: transaction.userId ? transaction.userId.username : 'N/A',
            email: transaction.userId ? transaction.userId.email : 'N/A',
            transactionId: transaction._id.toString(),
            createdAt: transaction.createdAt,
            amount: transaction.amount,
            proofPic: transaction.paymentProof
        }));

        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'Failed to fetch pending requests', error: error.message });
    }
});

// Approve a Request (Admin Only)
app.put('/api/request/:id/approve', authenticateAdmin, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending' || transaction.type !== 'deposit') {
            return res.status(400).json({ success: false, message: 'Invalid transaction status or type' });
        }

        const requestingUser = await User.findById(transaction.userId);
        if (!requestingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        transaction.status = 'completed';
        requestingUser.walletBalance += transaction.amount;

        await Promise.all([transaction.save(), requestingUser.save()]);
        
        res.status(200).json({ 
            success: true, 
            message: 'Request approved successfully', 
            transaction: {
                _id: transaction._id,
                status: transaction.status,
                amount: transaction.amount,
                userId: transaction.userId
            }
        });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to approve request', 
            error: error.message 
        });
    }
});

// Reject a Request (Admin Only)
app.put('/api/request/:id/reject', authenticateAdmin, async (req, res) => {
    try {
        const { rejectReason } = req.body;
        if (!rejectReason) {
            return res.status(400).json({ success: false, message: 'Reject reason is required' });
        }

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending' || transaction.type !== 'deposit') {
            return res.status(400).json({ success: false, message: 'Invalid transaction status or type' });
        }

        transaction.status = 'rejected';
        transaction.rejectReason = rejectReason;

        await transaction.save();
        res.status(200).json({ 
            success: true, 
            message: 'Request rejected successfully',
            transaction: {
                _id: transaction._id,
                status: transaction.status,
                rejectReason: transaction.rejectReason
            }
        });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reject request', 
            error: error.message 
        });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});