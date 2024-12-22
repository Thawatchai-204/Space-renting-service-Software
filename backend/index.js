require('dotenv').config(); // โหลดค่าจาก .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อกับ MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('เชื่อมต่อกับ MongoDB สำเร็จ'))
  .catch((err) => console.error('การเชื่อมต่อ MongoDB ล้มเหลว:', err.message));

// สร้าง Schema ของผู้ใช้
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});

const User = mongoose.model('User', userSchema);

// เส้นทางสำหรับการลงทะเบียน
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'ลงทะเบียนผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกผู้ใช้:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน', error: error.message });
  }
});

// เส้นทางสำหรับการเข้าสู่ระบบ
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'ไม่พบผู้ใช้' });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง' });
    }

    // สร้าง token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      userId: user._id,
      username: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
});
