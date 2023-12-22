const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;

//  middleware

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster57.zv2w8cs.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    const tasksCollection = client.db("taskCraftDB").collection("tasks");

    const userCollection = client.db("taskCraftDB").collection("users");

    // tasks releted api
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    // app.post("/tasks", async (req, res) => {
    //   const task = { ...req.body, userEmail: req.user.email }; // Assuming you have user information in req.user
    //   const result = await tasksCollection.insertOne(task);
    //   res.send(result);
    // });

    app.get("/tasks", async (req, res) => {
      try {
        const tasks = await tasksCollection.find().toArray();
        res.status(200).json(tasks);
      } catch (error) {
        console.error("Error retrieving tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.findOne(query);
      res.send(result);
    });

    app.patch("/updateTask/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateInfo = req.body;
      const updateOperation = {
        $set: {
          taskTitle: updateInfo.taskTitle,
          description: updateInfo.description,
          deadline: updateInfo.deadline,
          priority: updateInfo.priority,
        },
      };
      const result = await tasksCollection.updateOne(
        filter,
        updateOperation,
        options
      );
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    // app.patch("/updateTask/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   try {
    //     const task = await tasksCollection.findOne(query);

    //     if (!task) {
    //       return res.status(404).json({ error: "Task not found" });
    //     }
    //     const taskUpdateInfo = req.body;
    //     const updateOperation = {
    //       $set: {
    //         taskTitle: taskUpdateInfo.taskTitle,
    //         description: taskUpdateInfo.description,
    //         deadline: taskUpdateInfo.deadline,
    //         priority: taskUpdateInfo.priority,
    //       },
    //     };
    //     const result = await tasksCollection.updateOne(query, updateOperation);

    //     if (result.modifiedCount > 0) {
    //       res.json({ success: true, message: "Task updated successfully" });
    //     } else {
    //       res.status(500).json({ error: "Failed to update task" });
    //     }
    //   } catch (error) {
    //     console.error("Error updating task:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    // // user related API

    app.get("/user", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // app.get("/singleUser", async (req, res) => {
    //   const email = req.query.email;
    //   const result = await userCollection.findOne(email);
    //   res.send(result);
    // });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task-management system is running");
});

app.listen(port, () => {
  console.log(`task management system on port ${port}`);
});
