const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection details
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'buySell';

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log(`\nRAG service connected successfully to MongoDB\n`);
    return true;
  } catch (error) {
    console.log(`MongoDB connection error: ${error.message}`);
    console.log('Check your MongoDB connection settings in your .env file');
    return false;
  }
}

// Simple function to generate basic embeddings
function generateBasicEmbedding(text) {
  if (!text || typeof text !== 'string') return Array(10).fill(0);
  
  const normalizedText = text.toLowerCase();
  const vector = Array(10).fill(0);
  
  for (let i = 0; i < normalizedText.length; i++) {
    const code = normalizedText.charCodeAt(i);
    vector[i % 10] = (vector[i % 10] + code / 255) / 2;
  }
  
  return vector;
}

// Calculate similarity (cosine similarity)
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

// Get all items from MongoDB
async function getAllItems() {
  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB not connected when trying to get items');
    return [];
  }

  try {
    console.log('Looking for available collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    // Based on mongoose model naming convention, items from Item model would be in "items" collection
    const itemsCollection = mongoose.connection.collection('items');
    
    if (!itemsCollection) {
      console.log('Items collection not found');
      return [];
    }
    
    const items = await itemsCollection.find({}).toArray();
    console.log(`Found ${items.length} items in the items collection`);
    
    // Log a sample item to debug
    if (items.length > 0) {
      console.log('Sample item structure:', JSON.stringify(items[0], null, 2));
    }
    
    // Enhance items with seller information if needed
    const enhancedItems = [];
    for (const item of items) {
      try {
        if (item.sellerId) {
          const usersCollection = mongoose.connection.collection('users');
          const seller = await usersCollection.findOne({ _id: item.sellerId });
          if (seller) {
            enhancedItems.push({
              ...item,
              sellerName: `${seller.firstName} ${seller.lastName}`,
              sellerRating: seller.averageRating
            });
          } else {
            enhancedItems.push(item);
          }
        } else {
          enhancedItems.push(item);
        }
      } catch (err) {
        console.log('Error enhancing item with seller info:', err);
        enhancedItems.push(item);
      }
    }
    
    return enhancedItems;
  } catch (error) {
    console.error('Error retrieving items:', error);
    return [];
  }
}

// Call Gemini API with proper error handling
async function callGeminiAPI(prompt, apiKey) {
  try {
    console.log('Calling Gemini API...');
    console.log('Prompt excerpt:', prompt.substring(0, 200) + '...');
    
    const urls = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
    ];
    
    for (const url of urls) {
      try {
        console.log(`Trying URL: ${url.split('?')[0]}`);
        
        const geminiResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  },
                ],
              },
            ],
          }),
        });
        
        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error('Gemini API error response:', errorText);
          continue; // Try next URL
        }
        
        const geminiData = await geminiResponse.json();
        
        if (geminiData.candidates && 
            geminiData.candidates[0]?.content?.parts?.[0]?.text) {
          return geminiData.candidates[0].content.parts[0].text;
        }
      } catch (error) {
        console.error(`Error with URL ${url}:`, error);
      }
    }
    
    throw new Error('All API endpoints failed');
  } catch (error) {
    console.error('Error in Gemini API call:', error);
    return `I apologize, but there was an error connecting to the AI service. Please try again later. (Error: ${error.message})`;
  }
}

// Endpoint for RAG-powered chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory, apiKey } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    console.log('Processing chat request for message:', message);
    
    // Get all items from database
    const items = await getAllItems();
    console.log(`Retrieved ${items.length} items from database`);
    
    // Handle specific queries about available items
    let isAvailabilityQuery = message.toLowerCase().includes('available') || 
                             message.toLowerCase().includes('what can i buy') ||
                             message.toLowerCase().includes('what items') ||
                             message.toLowerCase().includes('products') ||
                             message.toLowerCase().includes('selling') ||
                             message.toLowerCase().includes('for sale');
    
    // Special handling for listing available items
    let context = "";
    
    if (isAvailabilityQuery) {
      console.log('Detected availability query, listing all items');
      // For availability queries, include all items (limited to avoid token limits)
      const maxItems = Math.min(items.length, 10);
      if (maxItems > 0) {
        context = `Here are the ${maxItems} most recent items for sale on IIIT-Marketplace:\n\n`;
        for (let i = 0; i < maxItems; i++) {
          const item = items[i];
          
          // Format item information based on your schema
          context += `${i + 1}. ${item.name || 'Unnamed Item'} - ₹${item.price || 'Price not specified'}\n`;
          
          // Include description if available
          if (item.description) {
            context += `   Description: ${item.description}\n`;
          }
          
          // Include category if available
          if (item.category) {
            context += `   Category: ${item.category}\n`;
          }
          
          // Include rating if available
          if (item.averageRating > 0) {
            context += `   Rating: ${item.averageRating.toFixed(1)}/5 (${item.totalReviews || 0} reviews)\n`;
          }
          
          // Include seller info if available
          if (item.sellerName) {
            context += `   Seller: ${item.sellerName}`;
            if (item.sellerRating > 0) {
              context += ` (Seller Rating: ${item.sellerRating.toFixed(1)}/5)`;
            }
            context += '\n';
          }
          
          context += '\n';
        }
      } else {
        context = "Currently, there are no items listed in the database.";
      }
    } else {
      // Standard RAG for other queries
      // Generate embedding for query
      const queryEmbedding = generateBasicEmbedding(message);
      
      // Find relevant items
      const relevantItems = items.map(item => {
        // Build item text from available fields
        const nameText = item.name || 'Unnamed Item';
        const descText = item.description || 'No description';
        const priceText = item.price ? `₹${item.price}` : 'Price not specified';
        const categoryText = item.category || 'Uncategorized';
        
        // Combine fields for matching
        const itemText = `Item: ${nameText}. Description: ${descText}. Price: ${priceText}. Category: ${categoryText}.`;
        
        const itemEmbedding = generateBasicEmbedding(itemText);
        const similarity = cosineSimilarity(queryEmbedding, itemEmbedding);
        
        return {
          item,
          content: itemText,
          similarity
        };
      })
      .filter(item => item.similarity > 0.5) // Only keep relevant items
      .sort((a, b) => b.similarity - a.similarity) // Sort by relevance
      .slice(0, 3); // Take top 3
      
      console.log(`Found ${relevantItems.length} relevant items`);
      
      if (relevantItems.length > 0) {
        context = "Based on our marketplace data, I can provide this information about relevant items:\n\n";
        relevantItems.forEach((record, i) => {
          const item = record.item;
          
          // Format item information
          context += `Item ${i + 1}: ${item.name || 'Unnamed Item'} - ₹${item.price || 'Price not specified'}\n`;
          
          // Include description if available
          if (item.description) {
            context += `Description: ${item.description}\n`;
          }
          
          // Include category if available
          if (item.category) {
            context += `Category: ${item.category}\n`;
          }
          
          // Include rating if available
          if (item.averageRating > 0) {
            context += `Rating: ${item.averageRating.toFixed(1)}/5 (${item.totalReviews || 0} reviews)\n`;
          }
          
          // Include seller info if available
          if (item.sellerName) {
            context += `Seller: ${item.sellerName}`;
            if (item.sellerRating > 0) {
              context += ` (Rating: ${item.sellerRating.toFixed(1)}/5)`;
            }
            context += '\n';
          }
          
          context += '\n';
        });
      } else {
        context = "I don't see any items in our database that match your query specifically.";
        
        // Add some general category info if available
        const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
        if (categories.length > 0) {
          context += ` However, we do have items in these categories: ${categories.join(', ')}.`;
        }
      }
    }
    
    // Build prompt for Gemini with very explicit instructions to use the context
    const prompt = `You are a helpful customer support assistant for IIIT Buy-Sell website.

===== DATABASE CONTEXT (VERY IMPORTANT - USE THIS DATA IN YOUR RESPONSE) =====
${context}
==================================================================

Previous conversation:
${conversationHistory || ""}

User: ${message}

IMPORTANT INSTRUCTIONS:
1. ALWAYS reference specific items mentioned in the DATABASE CONTEXT section above
2. Include item names, prices, and descriptions from the context in your response
3. If the DATABASE CONTEXT contains item information, your response MUST include these specific items
4. DO NOT make up fictional items - only mention items that are specifically listed in the context
5. If the context says there are no items, be honest about that fact
6. Be helpful and friendly in your response
`;
    
    console.log('Sending prompt to Gemini API with item context...');
    const responseText = await callGeminiAPI(prompt, apiKey);
    console.log('Received response from Gemini API');
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      error: 'Failed to process your request',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusText = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  res.json({ 
    status: 'ok',
    mongodb: statusText[mongoStatus] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('RAG Service is running! Try the /health endpoint for more info.');
});

// List items endpoint for debugging
app.get('/items', async (req, res) => {
  try {
    const items = await getAllItems();
    res.json({ 
      count: items.length,
      items: items.slice(0, 10) // Limit to 10 for the API response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all collections endpoint for debugging
app.get('/collections', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'MongoDB not connected' });
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ 
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server on the first available port
async function startServer() {
  const ports = [5001, 5002, 5003, 3001, 3002, 8080];
  
  for (const port of ports) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          console.log(`RAG service running on port ${port}`);
          resolve(port);
        });
        
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying next port...`);
            reject(err);
          } else {
            console.error(`Error starting server on port ${port}:`, err);
            reject(err);
          }
        });
      });
      
      // Server started successfully on this port
      return port;
    } catch (err) {
      // Try next port
    }
  }
  
  throw new Error('All ports are in use. Could not start the server.');
}

// Connect to MongoDB and start the server
connectToMongoDB()
  .then(async (mongoConnected) => {
    console.log('MongoDB connection status:', mongoConnected ? 'Connected' : 'Not connected');
    
    try {
      const port = await startServer();
      console.log(`Server is running and listening on port ${port}`);
      console.log(`Test the item listing at: http://localhost:${port}/items`);
      console.log(`View available collections at: http://localhost:${port}/collections`);
    } catch (err) {
      console.error('Failed to start server:', err);
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    // Still try to start the server even if MongoDB fails
    startServer().catch(err => {
      console.error('Failed to start server:', err);
    });
  });