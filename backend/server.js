// Import necessary modules
const express = require('express');
const mysql = require('mysql2'); // Using mysql2
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000
const secret = process.env.JWT_SECRET || 'secret'; // Use environment variable for secret

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL Connection Pool Configuration
const pool = mysql.createPool({
    connectionLimit: 10, // Example limit
    host: process.env.DB_HOST || 'database-1.c4foy0kcilc1.us-east-1.rds.amazonaws.com', // Use environment variables
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'IpalRobot1!',
    database: process.env.DB_NAME || 'ipal',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    queueLimit: 0
}).promise(); // Use promise wrapper for async/await support with pool.execute

// Check DB connection on startup (optional but good practice)
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully!');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    // Consider exiting if DB connection fails on startup
    // process.exit(1);
  });


// Create Users Table If It Doesn't Exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        gender ENUM('Male', 'Female', 'Other'),
        curr_weight DECIMAL(5,2),
        height_inches INT,
        goal_weight DECIMAL(5,2),
        date_of_birth DATE,
        age_in_years INT,
        date_excount_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        time_excount_created TIME DEFAULT (CURRENT_TIME()), /* Ensure CURRENT_TIME() syntax is correct for your MySQL version */
        dateTime_excount_created DATETIME DEFAULT CURRENT_TIMESTAMP /* Simplified - TIMESTAMP covers date and time */
    );
`;

pool.query(createTableQuery)
  .then(() => {
      console.log("Users table created or already exists.");
  })
  .catch(err => {
      console.error("Error creating table:", err);
  });

// ========================================================
// == USER REGISTRATION - REPLACED WITH DUPLICATE CHECK ==
// ========================================================
app.post('/api/register', async (req, res) => {
    // Destructure all expected fields from the request body
    const {
        username, password, email,
        first_name, last_name, gender,
        curr_weight, height_inches, goal_weight, date_of_birth
    } = req.body;

    // --- Basic Input Validation ---
    if (!username || !password || !email || !first_name || !last_name || !gender || curr_weight == null || height_inches == null || goal_weight == null || !date_of_birth) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    // Add more specific validation if needed (e.g., email format, password strength)

    try {
        // --- STEP 1: Check if username or email already exists ---
        const checkUserSql = "SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?";
        // Use pool.execute for prepared statements (better security/performance)
        const [results] = await pool.execute(checkUserSql, [username, email]); // Using await with promise pool

        if (results && results.length > 0 && results[0].count > 0) {
            // --- User already exists ---
            console.log(`Registration attempt failed: Username '${username}' or Email '${email}' already exists.`);
            return res.status(409).json({ success: false, message: 'Username or Email already exists.' }); // 409 Conflict
        } else {
            // --- User does NOT exist, proceed with insertion ---
            console.log(`Username '${username}' and Email '${email}' available. Proceeding with registration.`);
            try {
                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Calculate age (ensure date_of_birth is a valid date string)
                let age = null;
                try {
                    if (date_of_birth) {
                       const birthDate = new Date(date_of_birth);
                       const today = new Date();
                       age = today.getFullYear() - birthDate.getFullYear();
                       const m = today.getMonth() - birthDate.getMonth();
                       if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                           age--;
                       }
                       if (isNaN(age) || age < 0) age = null; // Reset if invalid
                    }
                } catch (dateError) {
                     console.error("Error processing date_of_birth:", dateError);
                     age = null; // Set age to null if DOB processing fails
                }

                // Prepare SQL INSERT statement
                const insertSql = `INSERT INTO users (username, password, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth, age_in_years)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                // Ensure params match the order and number of columns
                const insertParams = [
                    username, hashedPassword, email,
                    first_name, last_name, gender,
                    curr_weight, height_inches, goal_weight,
                    date_of_birth, age // Pass calculated age (can be null)
                ];

                // Execute the INSERT query
                const [insertResults] = await pool.execute(insertSql, insertParams); // Using await

                // --- Registration Successful ---
                console.log(`User '${username}' registered successfully. ID: ${insertResults.insertId}`);
                res.status(201).json({ success: true, message: 'User registered successfully' }); // 201 Created

            } catch (error) { // Catch errors during hashing or inserting
                console.error("Error during user insertion or hashing:", error);
                // Check specifically for duplicate entry errors that might occur
                // despite the initial check (e.g., race condition)
                if (error.code === 'ER_DUP_ENTRY') {
                     return res.status(409).json({ success: false, message: 'Username or Email already exists (concurrent registration).' });
                }
                res.status(500).json({ success: false, message: 'Server error during registration process.' });
            }
        }
    } catch (error) { // Catch errors during the initial user check query or other unexpected issues
        console.error("Server error in /api/register route:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
// ========================================================
// == END OF REPLACED USER REGISTRATION ROUTE           ==
// ========================================================


// User Sign-In (Using pool.execute and async/await)
app.post('/api/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [results] = await pool.execute(sql, [username]); // Using await

        if (results.length === 0) {
            console.log(`Signin attempt failed: Username '${username}' not found.`);
            // Use 401 Unauthorized for failed login attempts
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log(`User '${username}' signed in successfully.`);
            // Create JWT token - include only necessary, non-sensitive info
            const tokenPayload = { userId: user.user_id, username: user.username };
            const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' }); // 1 hour expiration

            // Send back success, token, and maybe some non-sensitive user info
            res.json({
                success: true,
                token,
                user: { // Only send back needed, non-sensitive info
                    userId: user.user_id,
                    username: user.username,
                    firstName: user.first_name
                    // DO NOT send back password hash or other sensitive details
                }
             });
        } else {
            console.log(`Signin attempt failed: Incorrect password for username '${username}'.`);
            // Use 401 Unauthorized for failed login attempts
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Database error during signin:", error);
        res.status(500).json({ success: false, message: 'Server error during sign in.' });
    }
});

// Get All Users (Example - Consider security/privacy implications)
app.get('/api/users', async (req, res) => {
    // WARNING: In a real app, protect this endpoint! Only admins should access all users.
    try {
        const [results] = await pool.query('SELECT user_id, username, email, first_name, last_name FROM users'); // Select only needed fields
        res.json(results);
    } catch (error) {
        console.error("Database error getting users:", error);
        res.status(500).json({ success: false, message: 'Server error fetching users.' });
    }
});



// Start the server - ONLY if run directly (e.g., using "node server.js" or "npm start")
// This prevents the server from starting automatically when imported by test files
if (require.main === module) {
    // Define port inside this block if not already defined globally in the file
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${port} and accessible externally`);
    });
}

// Export the app object for testing purposes (and potentially other modules)
// Export both app and pool
module.exports = { app, pool };
