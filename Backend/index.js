require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); // ✅ CHANGE
const passport = require("passport");
const cors = require("cors");

require('./passport');

const authRoute = require("./Route/auth");

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: "https://stack-saas.vercel.app", // ✅ CHANGE",
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ better format
    credentials: true,
  })
);

// ✅ BODY PARSER
app.use(express.json());

// ✅ SESSION (FIXED)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "abc123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only in HTTPS production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ✅ PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// ✅ DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));

// ✅ ROUTES
app.get('/', (req, res) => {
  res.send('API running 🚀');
});

app.use("/api/search", require("./Route/stacksearch"));
app.use("/api/analyze", require("./Route/analysis"));
app.use("/api/recent", require("./Route/recent"));
app.use("/api/payment", require("./Route/payment"));

app.use("/auth", authRoute);

// ✅ SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});