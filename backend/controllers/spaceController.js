const Space = require('./models/space');

// สร้างพื้นที่เช่าใหม่
exports.createSpace = async (req, res) => {
  try {
    const space = new Space(req.body);
    await space.save();
    res.status(201).send(space);
  } catch (error) {
    res.status(400).send(error);
  }
};

// ดึงข้อมูลพื้นที่ทั้งหมด
exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find({});
    res.status(200).send(spaces);
  } catch (error) {
    res.status(500).send(error);
  }
};

// แก้ไขข้อมูลพื้นที่
exports.updateSpace = async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const space = await Space.findById(req.params.id);
    updates.forEach((update) => (space[update] = req.body[update]));
    await space.save();
    res.status(200).send(space);
  } catch (error) {
    res.status(400).send(error);
  }
};

// ลบพื้นที่
exports.deleteSpace = async (req, res) => {
  try {
    const space = await Space.findByIdAndDelete(req.params.id);
    if (!space) {
      return res.status(404).send();
    }
    res.status(200).send(space);
  } catch (error) {
    res.status(500).send(error);
  }
};
