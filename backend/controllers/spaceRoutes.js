const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');

// สร้างพื้นที่เช่าใหม่
router.post('/spaces', spaceController.createSpace);

// ดึงข้อมูลพื้นที่ทั้งหมด
router.get('/spaces', spaceController.getSpaces);

// แก้ไขข้อมูลพื้นที่
router.patch('/spaces/:id', spaceController.updateSpace);

// ลบพื้นที่
router.delete('/spaces/:id', spaceController.deleteSpace);

module.exports = router;
