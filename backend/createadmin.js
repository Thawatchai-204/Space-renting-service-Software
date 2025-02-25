const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 

// ใช้ MONGO_URI 
const MONGO_URI = 'mongodb+srv://6310110204:p3nudcP1HBJdfEko@srss.alag1un.mongodb.net/?retryWrites=true&w=majority&appName=SRSS';
    
// เชื่อมต่อ MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// ฟังก์ชันสร้างบัญชีแอดมิน
const createAdmin = async () => {
  try {
    const email = 'admin@example.com'; // อีเมลของแอดมิน
    const password = 'admin1234'; // รหัสผ่านของแอดมิน
    const hashedPassword = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่าน

    // ตรวจสอบว่ามีบัญชีแอดมินอยู่แล้วหรือไม่
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin account already exists');
      mongoose.connection.close();
      return;
    }

    // สร้างบัญชีแอดมินใหม่
    const adminUser = new User({
      email: email,
      password: hashedPassword,
      role: 'admin', // ระบุ role เป็น admin
    });

    await adminUser.save(); // บันทึกบัญชีลงฐานข้อมูล
    console.log('Admin account created successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin account:', error.message);
    mongoose.connection.close();
  }
};

createAdmin();
