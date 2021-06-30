const express = require("express");
const app = express();
const morgan = require("morgan");
const { sequelize, User, Post } = require("./models"); // imports the User from models

app.use(express.urlencoded({ extended: false })); // parses and creates a readable req.body
app.use(morgan("dev")); // logger for terminal
app.use(express.json()); // parses the body if it's a json

app.post("/users", async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const user = await User.create({ name, email, role });
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const users = await User.findOne({
      where: {
        uuid,
      },
      include: "posts",
    });
    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/posts", async (req, res) => {
  // THIS IS COMING FROM POSTMAN,
  /*
    {
        "body": "This is a new post",
        "userUuid": "aa91a233-202b-412c-89bc-747bd1422fad"
    }   
    */
  const { userUuid, body } = req.body;
  try {
    const user = await User.findOne({
      where: {
        uuid: userUuid,
      },
    });
    const post = await Post.create({ userId: user.id, body });
    // We can now create our post with our userUuid and body.
    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, as: "user" }],
    });
    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.delete("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const user = await User.findOne({ where: { uuid } });
    await user.destroy();
    return res.json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.put("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  const { name, email, role } = req.body;
  try {
    const user = await User.findOne({ where: { uuid } });

    user.name = name;
    user.email = email;
    user.role = role;

    await user.save();
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
app.listen(5000, async () => {
  console.log("Server up on port 5000!");
  await sequelize.authenticate(); // authenticate does not create the table like sync would, you must call sequelize db:migrate.
  console.log("Database connected!");
});
