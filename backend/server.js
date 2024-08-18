const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Space = require('./models/Space'); // Import โมเดล Space

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อมต่อกับ MongoDB
mongoose.connect('mongodb://localhost:27017/space-renting-service-Software', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// สร้าง Schema และโมเดลสำหรับผู้ใช้
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
}, { collection: 'service_provider' });

const User = mongoose.model('service_provider', userSchema);

// ฟังก์ชันสำหรับการลงทะเบียน (register)
app.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).send('All fields are required');
        }

        const hashedPassword = await bcrypt.hash(password, 10); // ทำ Hash รหัสผ่าน
        const newUser = new User({ email, password: hashedPassword, role });

        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).send('Error registering user');
    }
});

// ฟังก์ชันสำหรับการล็อกอิน (login)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ตรวจสอบว่าข้อมูลครบถ้วน
        if (!email || !password) {
            return res.status(400).send('Email and password are required');
        }

        // ค้นหาผู้ใช้ในฐานข้อมูลตามอีเมล
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        // ถ้าข้อมูลถูกต้อง ส่งสถานะสำเร็จกลับไป
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).send('Error during login');
    }
});

// ฟังก์ชันสำหรับการจัดการพื้นที่ (manage space)
app.post('/api/manage-space', async (req, res) => {
  try {
    const space = new Space(req.body); // รับข้อมูลจาก client
    await space.save(); // บันทึกข้อมูลลง MongoDB
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`เซิร์ฟเวอร์กำลังทำงานบนพอร์ต ${PORT}`));

