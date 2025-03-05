const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
import { v4 as uuidv4 } from 'uuid'; // ต้องติดตั้ง package: npm install uuid

const handleReserve = async () => {
    if (isReserving) {
        console.log('การจองถูกเรียกซ้ำ ข้ามการดำเนินการ');
        return;
    }

    if (!userId || !selectedSpace || !selectedSpace._id || !reservationStartDate || !reservationEndDate || !reservationStartTime || !reservationEndTime) {
        alert(language === 'EN' ? 'Please complete all required fields.' : 'กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const totalPrice = calculateTotalPrice();
    if (totalPrice === 0) {
        alert(language === 'EN' ? 'Invalid time range.' : 'ช่วงเวลาไม่ถูกต้อง');
        return;
    }
    if (walletBalance < totalPrice) {
        alert(language === 'EN' ? 'Insufficient wallet balance.' : 'ยอดเงินในกระเป๋าไม่เพียงพอ');
        return;
    }

    const isAvailable = await checkOverlap(selectedSpace._id, reservationStartDate, reservationEndDate, reservationStartTime, reservationEndTime);
    if (!isAvailable) {
        alert(language === 'EN' ? 'This time slot is already booked.' : 'ช่วงเวลานี้ถูกจองแล้ว');
        return;
    }

    setIsReserving(true);
    console.log('เริ่มการจอง:', { userId, spaceId: selectedSpace._id, totalPrice, timestamp: new Date().toISOString() });

    try {
        // สร้าง request ID ที่ไม่ซ้ำกันด้วย uuid
        const requestId = uuidv4(); // ใช้ UUID v4 เพื่อรับประกันความไม่ซ้ำ
        const reservationResponse = await axios.post('http://localhost:5000/api/reserve', {
            spaceId: selectedSpace._id,
            userId: userId,
            startDate: reservationStartDate,
            endDate: reservationEndDate,
            startTime: reservationStartTime,
            endTime: reservationEndTime,
            totalPrice: totalPrice,
        }, {
            headers: { 'X-Request-Id': requestId } // ส่ง requestId ไปยัง backend
        });

        if (reservationResponse.data.success) {
            // หักเงินจากผู้จองเพียงครั้งเดียว
            console.log('หักเงินจากผู้จอง (Booking payment):', { userId, amount: -totalPrice, requestId });
            await axios.put(`http://localhost:5000/api/wallet/${userId}`, { amount: -totalPrice }, {
                headers: { 'X-Request-Id': requestId }
            });

            // เพิ่มเงินให้เจ้าของพื้นที่
            const ownerId = selectedSpace.userId;
            if (ownerId && ownerId.toString()) {
                console.log('เพิ่มเงินให้เจ้าของ:', { ownerId, amount: totalPrice, requestId });
                await axios.put(`http://localhost:5000/api/wallet/${ownerId}`, { amount: totalPrice }, {
                    headers: { 'X-Request-Id': requestId }
                });
            } else {
                console.error('ไม่พบรหัสเจ้าของพื้นที่ (userId) หรือค่าไม่ถูกต้อง:', selectedSpace);
                toast.error(language === 'EN' ? 'Failed to credit owner wallet. Owner ID not found.' : 'ไม่สามารถเพิ่มเงินให้เจ้าของพื้นที่ได้ รหัสเจ้าของไม่ถูกต้อง', { position: "top-center", autoClose: 2000 });
            }

            // อัปเดตข้อมูล
            fetchWalletBalance(userId);
            fetchReservations(userId);
            toast.success(language === 'EN' ? `Successfully reserved ${selectedSpace.name}!` : `จอง ${selectedSpace.name} สำเร็จ!`, { position: "top-center", autoClose: 2000 });
            closeModal();
        } else {
            alert(reservationResponse.data.message || (language === 'EN' ? 'Failed to reserve space.' : 'ไม่สามารถจองพื้นที่ได้'));
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการจอง:', error);
        if (error.response) {
            if (error.response.status === 409) {
                alert(language === 'EN' ? 'This reservation request has already been processed. Please try again.' : 'คำขอจองนี้ถูกประมวลผลแล้ว กรุณาลองใหม่');
            } else if (error.response.status === 401) {
                navigate('/login');
            } else {
                alert(language === 'EN' ? 'Failed to reserve space.' : 'ไม่สามารถจองพื้นที่ได้');
            }
        } else {
            alert(language === 'EN' ? 'Failed to reserve space. Please check your connection.' : 'ไม่สามารถจองพื้นที่ได้ กรุณาตรวจสอบการเชื่อมต่อ');
        }
    } finally {
        setIsReserving(false);
        console.log('สิ้นสุดการจอง');
    }
};

// สร้างฟังก์ชัน debouncedHandleReserve
const debouncedHandleReserve = debounce(() => {
    handleReserve();
}, 7000); // เพิ่ม delay เป็น 7 วินาทีเพื่อป้องกันการกดซ้ำ
// API สำหรับสร้างการจอง
router.post('/reserve', async (req, res) => {
    const { user, spaceId, date, time } = req.body;

    // ตรวจสอบว่ามีการจองพื้นที่ในช่วงวันเวลานี้แล้วหรือไม่
    const existingReservation = await Reservation.findOne({ spaceId, date, time });
    if (existingReservation) {
        return res.status(400).json({ success: false, message: 'This space is already reserved for this time.' });
    }

    // สร้างการจองใหม่
    const newReservation = new Reservation({
        user,
        spaceId,
        date,
        time
    });

    try {
        await newReservation.save();
        res.json({ success: true, message: 'Reservation successful!', reservation: newReservation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving reservation', error });
    }
});
const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');
const Wallet = require('./models/Wallet');
const Request = require('./models/Request'); // Model สำหรับเก็บ request ID

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
            throw new Error('Missing required fields');
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
            ownerTransaction.save({ status: 'completed' })
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
module.exports = router;