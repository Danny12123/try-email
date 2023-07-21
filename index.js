const express = require("express")
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");

const authRoute = require('./route/auth')
const userRoute = require('./route/user');
const postRoute = require('./route/post');
const conversationRoute = require('./route/conversation');
const messageRoute = require('./route/message');


const options = {
  rejectUnauthorized: false,
};
dotenv.config();
app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:3000'
// }));
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

mongoose
  .connect(
    process.env.MONGO_URL,
    {
      useNewUrlParser: true,
    },
    options
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

  app.use(express.json());
  app.use(helmet());
  app.use(morgan("common"));
  app.use(express.static("public/image"));
  
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
    // cb(null, Date.now() + '-' + file.name);
  },
});
const upload = multer({ storage });
app.post("/api/upload", upload.single("files"), (req, res) => {
  try {
    return res.status(200).json("File has been uploaded");
  } catch (error) {
    console.error(error);
  }
});



  app.use("/api/auth", authRoute);
  app.use("/api/user", userRoute);
  app.use("/api/post", postRoute);
  app.use("/api/conversation", conversationRoute);
  app.use("/api/message", messageRoute);

app.listen(4000, () => console.log("Backend is running!"));