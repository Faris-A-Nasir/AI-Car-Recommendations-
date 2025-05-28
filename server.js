const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Routes
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chatRoutes'); // ✅ added

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes); // ✅ added


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
