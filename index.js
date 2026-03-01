const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// express app for vercel serverless
const app = express();

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yxfp204.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// cached collections so that we don't reconnect on every invocation
let booksCollection;
let commentsCollection;

async function initDb() {
  if (!booksCollection || !commentsCollection) {
    await client.connect();
    const db = client.db("book_heaven_db");
    booksCollection = db.collection("books");
    commentsCollection = db.collection("comments");
  }
}

// books api----------------------------------------
// all books
app.get("/all-books", async (req, res) => {
  await initDb();
  const result = await booksCollection.find().sort({ created_at: -1 }).toArray();
  res.send(result);
});

// featured book
app.get("/featured-book", async (req, res) => {
  await initDb();
  const query = { rating: 5 };
  const result = await booksCollection
    .find(query)
    .sort({ created_at: -1 })
    .limit(1)
    .toArray();
  res.send(result);
});

// single book
app.get("/book/:id", async (req, res) => {
  await initDb();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await booksCollection.findOne(query);
  res.send(result);
});

// my books
app.get("/my-books", async (req, res) => {
  await initDb();
  const email = req.query.email;
  const query = { userEmail: email };
  const result = await booksCollection
    .find(query)
    .sort({ created_at: -1 })
    .toArray();
  res.send(result);
});

// latest books
app.get("/latest-books", async (req, res) => {
  await initDb();
  const result = await booksCollection
    .find()
    .sort({ created_at: -1 })
    .limit(6)
    .toArray();
  res.send(result);
});

// add book
app.post("/add-book", async (req, res) => {
  await initDb();
  const bookData = req.body;
  const result = await booksCollection.insertOne(bookData);
  res.send(result);
});

// update book
app.patch("/update-book/:id", async (req, res) => {
  await initDb();
  const id = req.params.id;
  const updateData = req.body;
  const query = { _id: new ObjectId(id) };
  const updatedDoc = { $set: updateData };
  const result = await booksCollection.updateOne(query, updatedDoc);
  res.send(result);
});

// delete book
app.delete("/book/:id", async (req, res) => {
  await initDb();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await booksCollection.deleteOne(query);
  res.send(result);
});

// comments api--------------------------------------------------------------

// get comments for a book
app.get("/comments/:id", async (req, res) => {
  await initDb();
  const id = req.params.id;
  const query = { bookId: id };
  const result = await commentsCollection
    .find(query)
    .sort({ created_at: -1 })
    .limit(10)
    .toArray();
  res.send(result);
});

// post a comment
app.post("/comments", async (req, res) => {
  await initDb();
  const commentData = req.body;
  commentData.created_at = new Date();
  const result = await commentsCollection.insertOne(commentData);
  res.send(result);
});

// delete a comment
app.delete("/comments/:id", async (req, res) => {
  await initDb();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await commentsCollection.deleteOne(query);
  res.send(result);
});

// root
app.get("/", (req, res) => {
  res.send("The Book Heaven Is Online!");
});

// export for vercel
module.exports = app;
