const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export const getSpaces = async () => {
    const response = await fetch('http://localhost:5000/api/spaces');
    if (!response.ok) {
      throw new Error('Failed to fetch spaces');
    }
    const data = await response.json();
    return data;
  };
