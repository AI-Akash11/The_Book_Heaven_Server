const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;

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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("book_heaven_db");
    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments");

    // books api----------------------------------------
    // all bokks get api
    app.get("/all-books", async (req, res) => {
      const result = await booksCollection.find().sort({ created_at: -1 }).toArray();
      res.send(result);
    });

    // get featured book api
    app.get('/featured-book',async (req, res) => {
      const query = {rating: 5}
      const result = await booksCollection.find(query).sort({ created_at: -1 }).limit(1).toArray();
      res.send(result);
    })

    // single book get api
    app.get('/book/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}

        const result = await booksCollection.findOne(query);
        res.send(result)
    })

    // my books api
    app.get('/my-books', async (req, res)=>{
        const email = req.query.email;
        const query = {userEmail : email}

        const result = await booksCollection.find(query).sort({ created_at: -1 }).toArray();
        res.send(result)
    })


    // latest-books api----------------------------------
    app.get("/latest-books", async (req, res) => {
      const result = await booksCollection
        .find()
        .sort({ created_at: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // add-book post api------------------------------------
    app.post('/add-book',async(req, res)=>{
      const bookData = req.body;
      const result = await booksCollection.insertOne(bookData);
      res.send(result)
    })

    // book update api--------------------------------------------
    app.patch('/update-book/:id', async(req, res)=>{
      const id= req.params.id;
      const updateData = req.body;

      const query = {_id: new ObjectId(id)}
      const updatedDoc = {
        $set: updateData
      }
      const result = await booksCollection.updateOne(query, updatedDoc);
      res.send(result)
    })

    // book delete api--------------------------------------------
    app.delete('/book/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await booksCollection.deleteOne(query);
      res.send(result)
    })






    // comments api--------------------------------------------------------------

    app.post('/comments', async(req, res)=>{
      const commentData = req.body;
      commentData.created_at = new Date();

      const result = await commentsCollection.insertOne(commentData);
      res.send(result)

    })












    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The Book Heaven Is Online!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
