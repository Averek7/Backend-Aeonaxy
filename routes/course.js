const router = require("express").Router();
const db = require("../db/connection");
const verifyToken = require("../middleware/verifyToken");

router.get("/", async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { category, level, popularity } = req.query;

    let query = "SELECT * FROM courses";
    let params = [];
    let whereClause = [];

    // Filtering conditions
    if (category) {
      whereClause.push("category = $" + (params.length + 1));
      params.push(category);
    }
    if (level) {
      whereClause.push("level = $" + (params.length + 1));
      params.push(level);
    }
    if (popularity) {
      whereClause.push("popularity = $" + (params.length + 1));
      params.push(popularity);
    }

    if (whereClause.length > 0) {
      query += " WHERE " + whereClause.join(" AND ");
    }

    query +=
      " ORDER BY id OFFSET $" +
      (params.length + 1) +
      " LIMIT $" +
      (params.length + 2);
    params.push(offset, limit);

    const { rows } = await db.pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/create", verifyToken, async (req, res, next) => {
  try {
    const { title, description, category, level, popularity } = req.body;
    const { userId } = req;

    const superuser = await db.pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (superuser.rows[0].role !== "superuser") {
      res.status(403).json({ error: "Forbidden" });
    }

    const { rows } = await db.pool.query(
      "INSERT INTO courses (title, description, category, level, popularity, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, category, level, popularity, userId]
    );

    res
      .status(201)
      .json({ message: "Course created successfully!", course: rows[0] });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db.pool.query("SELECT * FROM courses WHERE id = $1", [
      id,
    ]);

    if (course.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({"Course": course.rows[0]});
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, category, level, popularity } = req.body;
    const { userId } = req;
    const { id } = req.params;
    const updateFields = [];
    const params = [];

    const superuser = await db.pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (superuser.rows[0].role !== "superuser") {
      res.status(403).json({ error: "Forbidden" });
    }

    if (title) {
      updateFields.push("title = $" + (params.length + 1));
      params.push(title);
    }

    if (description) {
      updateFields.push("description = $" + (params.length + 1));
      params.push(description);
    }

    if (category) {
      updateFields.push("category = $" + (params.length + 1));
      params.push(category);
    }

    if (level) {
      updateFields.push("level = $" + (params.length + 1));
      params.push(level);
    }

    if (popularity){
      updateFields.push("popularity = $" + (params.length + 1));
      params.push(popularity);
    }

    const updateQuery =
      "UPDATE courses SET " +
      updateFields.join(", ") +
      " WHERE id = $" +
      (params.length + 1);
    params.push(id);

    await db.pool.query(updateQuery, params, (error, result) => {
      if (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json({message: "Course updated successfully!", data: result.rows[0]});
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/remove/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {userId} = req;
    
    const superuser = await db.pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        
    if(superuser.rows[0].role !== 'superuser') {
        res.status(403).json({ error: 'Forbidden' });
    }
    
    console.log(id, userId, superuser.rows[0].role)
    
    const deleteQuery = "DELETE FROM courses WHERE id = $1";
    const params = [id];

    await db.pool.query(deleteQuery, params, (error, result) => {
      if (error) {
        console.error("Error removing course:", error);
        res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json({message: "Course removed successfully!"});
    });
  } catch (error) {
    console.error("Error removing course: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
