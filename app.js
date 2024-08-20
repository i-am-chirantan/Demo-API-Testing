// Load environment variables from the .env file
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected to the cloud'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema
const itemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String }
});

// Create a model
const Item = mongoose.model('Item', itemSchema);

// Create - POST
app.post('/items', async (req, res) => {
  console.log('POST request received:', req.body);

  const newItem = req.body;

  // Validate the required fields (id and name)
  if (!newItem.id || !newItem.name) {
    console.log('Validation failed: ID and name are required.');
    return res.status(400).json({ error: 'ID and name are required fields' });
  }

  try {
    // Check if the ID already exists
    const existingItem = await Item.findOne({ id: newItem.id });
    if (existingItem) {
      console.log('ID already exists:', newItem.id);
      return res.status(409).json({ error: 'ID already exists. Please use a unique ID.' });
    }

    // Add the new item to the database
    const item = new Item(newItem);
    await item.save();
    console.log('New item added:', newItem);

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read - GET
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a specific item by ID
app.get('/items/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);
  try {
    const item = await Item.findOne({ id: itemId });

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update - PUT
app.put('/items/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);
  const updatedItem = req.body;

  try {
    const item = await Item.findOneAndUpdate({ id: itemId }, updatedItem, { new: true });

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Patch - PATCH
app.patch('/items/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);
  const updateFields = req.body;

  try {
    const item = await Item.findOneAndUpdate({ id: itemId }, updateFields, { new: true });

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error patching item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete - DELETE
app.delete('/items/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);

  try {
    const result = await Item.deleteOne({ id: itemId });

    if (result.deletedCount > 0) {
      res.sendStatus(204); // No Content
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
