require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); // ✅ CHANGE
const passport = require("passport");
const cors = require("cors");

require('./passport');

const authRoute = require("./Route/auth");

const app = express();

const SERVER_URL = process.env.SERVER_URL || "https://stacksaas.onrender.com";
const CLIENT_URL = process.env.CLIENT_URL || "https://stack-saas.vercel.app";
const isProd = process.env.NODE_ENV === "production" || !!process.env.SERVER_URL;

if (isProd) {
  app.set("trust proxy", 1);
}

// ✅ CORS
const allowedOrigins = [CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors({ origin: allowedOrigins, credentials: true }));

// ✅ BODY PARSER
app.use(express.json());

// ✅ SESSION (FIXED)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "abc123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
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