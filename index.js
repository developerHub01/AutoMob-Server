const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 5000;
const uri = process.env.DB;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();

    const productCollection = client.db("autoMob").collection("product");
    const cartListCollection = client.db("autoMob").collection("cart");

    app.get("/", async (req, res) => {
      res.send("Home route..............");
    });

    app.post("/addproduct", async (req, res) => {
      const productData = req.body;

      const result = await productCollection.insertOne(productData);

      res.send(result.acknowledged);
    });

    app.get("/brandDataList/:category", async (req, res) => {
      const productCategory = req.params.category;

      const result = await productCollection
        .find({ productCategory })
        .toArray();

      console.log(result);
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;

      const result = await productCollection.findOne({ _id: new ObjectId(id) });

      console.log(result);
      res.send(result);
    });

    app.get("/cartlist/:email", async (req, res) => {
      console.log("==============");
      const email = req.params.email;
      console.log(email);
      const result = await cartListCollection.find({ email }).toArray();
      res.send(result ||"{}");
    });

    app.post("/cartlist", async (req, res) => {
      const cartData = req.body;
      const email = req.params.email;
      console.log(cartData);
      const result = await cartListCollection.insertOne(cartData);

      console.log(result);
      res.send(result.acknowledged);
    });

    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const productData = req.body;
      const result = await productCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...productData,
          },
        }
      );
      res.send(result.acknowledged);
    });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);
