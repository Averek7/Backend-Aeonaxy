const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/connection");
const multer = require("multer")
const cloudinary = require('cloudinary');
const fs = require('fs');
const verifyToken = require("../middleware/verifyToken");
require("dotenv").config();

          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});


router.post("/register", async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, bio, profile_picture} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    let profile_picture_url = '';
    
    if (profile_picture) {
      const result = await cloudinary.v2.uploader.upload(profile_picture);
      profile_picture_url = result.secure_url;
    }
    
    await db.pool.query(
      "INSERT INTO users (username, email, password_hash, first_name, last_name, profile_picture_url, bio) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [username, email, hashedPassword, first_name, last_name, profile_picture_url, bio],
      (error, results) => {
        if (error) {
          throw error;
        }
        const token = jwt.sign({ id: results.rows[0].id }, process.env.SECRET, {
          expiresIn: 86400,
        });
        res.status(200).send({ auth: true, token });
      }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const hashedPassword = user.rows[0].password_hash;

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ auth: true, token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", verifyToken, async(req, res) => {
  try {
    await db.pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [req.userId],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).json(results.rows[0]);
      }
    );
} catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});


router.put("/update", verifyToken, async (req, res) => {
  try {
    const { first_name, last_name, bio, role, profile_picture } = req.body;
    let profile_picture_url = '';

    if (profile_picture) {
      const result = await cloudinary.v2.uploader.upload(profile_picture);
      profile_picture_url = result.secure_url;
    }

    let updateFields = [];
    let params = [];

    if (first_name) {
      updateFields.push('first_name = $' + (params.length + 1));
      params.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = $' + (params.length + 1));
      params.push(last_name);
    }
    if (profile_picture_url) {
      updateFields.push('profile_picture_url = $' + (params.length + 1));
      params.push(profile_picture_url);
    }
    if (bio) {
      updateFields.push('bio = $' + (params.length + 1));
      params.push(bio);
    }
    if (role) {
      updateFields.push('role = $' + (params.length + 1));
      params.push(role);
    }

    const updateQuery = 'UPDATE users SET ' + updateFields.join(', ') + ' WHERE id = $' + (params.length + 1);
    params.push(req.userId);

    await db.pool.query(updateQuery, params, (error, results) => {
      if (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({ message: 'User profile updated successfully' });
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
