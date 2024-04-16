const db = require('../db/connection');

// db.pool.query(
//   `CREATE TABLE IF NOT EXISTS users (
//    id SERIAL PRIMARY KEY,
//    username VARCHAR(255) UNIQUE NOT NULL,
//    email VARCHAR(255) UNIQUE NOT NULL,
//    password_hash VARCHAR(255) NOT NULL,
//    first_name VARCHAR(50),
//    last_name VARCHAR(50),
//    profile_picture_url VARCHAR(255),
//    bio TEXT,
//    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'superuser'));
//    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )`
// );
// console.log("Created !");

// db.pool.query(
//   `CREATE TABLE courses (
//    id SERIAL PRIMARY KEY,
//    user_id INT REFERENCES users(id),
//    title VARCHAR(255) NOT NULL,
//    description TEXT,
//    category VARCHAR(50),
//    level VARCHAR(20),
//    popularity INT DEFAULT 0,
//    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );`
// );
// console.log("Created !");

db.pool.query(
  `CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    course_id INT REFERENCES courses(id),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
console.log("Created !")