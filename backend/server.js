// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// --- ADD THIS ---
const { body, validationResult } = require('express-validator'); // Import validation functions

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.JWT_SECRET || 'secret'; // Use environment variable for secret

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
// Use express's built-in parser instead of bodyParser if preferred
// app.use(express.json());
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
}).promise(); // Use promise wrapper for async/await support

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
// == USER REGISTRATION VALIDATION RULES                 ==
// ========================================================
const registrationValidationRules = [
  // Email: check if it's an email and normalize it
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),

  // Username: trim whitespace, ensure not empty, check min length
  body('username').trim().notEmpty().withMessage('Username is required.')
                 .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),

  // Password: check min length (add more rules like isStrongPassword() if desired)
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),

// --- ADD THIS RULE for Password Confirmation ---
  body('password_confirmation')
             .notEmpty().withMessage('Password confirmation is required.') // First check if it's empty
    .custom((value, { req }) => {
             if (value !== req.body.password) {
    // Throw an error if passwords don't match. Express-validator catches this.
             throw new Error('Passwords do not match');
  }
  // Indicates the success of this synchronous custom validator
             return true;
}),
// --- END OF ADDED RULE ---

  // First Name: trim whitespace, ensure not empty
  body('first_name').trim().notEmpty().withMessage('First Name is required.'),

  // Last Name: trim whitespace, ensure not empty
  body('last_name').trim().notEmpty().withMessage('Last Name is required.'),

  // Gender: check if it's one of the allowed values
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender selected.'),

  body('curr_weight')
  .isFloat({ gt: 0, lt: 1000 }) // <<< Add lt: 1000 here
  .withMessage('Current Weight must be a positive number less than 1000.'), // Update message

  body('height_inches')
  .isInt({ gt: 0, lt: 120 }) // <<< Add lt: 120 here (for 10ft)
  .withMessage('Height must be a positive whole number less than 300 inches.'), // Update message

  body('goal_weight')
  .isFloat({ gt: 0, lt: 1000 }) // <<< Add lt: 1000 here
  .withMessage('Goal Weight must be a positive number less than 1000.'), // Update message



  // Date of Birth: check if it's a valid date format (YYYY-MM-DD) and convert to Date object
  body('date_of_birth').isISO8601().withMessage('Invalid Date of Birth format (use YYYY-MM-DD).').toDate()
    // Optional: Add custom validation, e.g., check if date is not in the future
    .custom(value => {
        if (value > new Date()) {
            throw new Error('Date of Birth cannot be in the future.');
        }
        return true; // Indicates validation passed
    }),
];


// ========================================================
// == USER REGISTRATION ROUTE with Validation            ==
// ========================================================
// Apply validation rules as middleware BEFORE the main route handler
app.post('/api/register', registrationValidationRules, async (req, res) => {

    // --- STEP 1: Check for validation errors ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If errors exist, return 400 Bad Request with the errors
        console.log("Registration validation errors:", errors.array());
        // Return only the first error message for simplicity to the frontend
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
        // Or return all errors: return res.status(400).json({ success: false, errors: errors.array() });
    }

    // --- Validation passed, proceed with registration logic ---
    // Destructure validated/sanitized data (comes from express-validator now)
     const {
        username, password, email,
        first_name, last_name, gender,
        curr_weight, height_inches, goal_weight, date_of_birth // date_of_birth is now a Date object
    } = req.body; // Note: express-validator modifies req.body with sanitized/converted values

    try {
        // --- STEP 2: Check if username or email already exists ---
        const checkUserSql = "SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?";
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

                // Calculate age from the validated Date object
                let age = null;
                try {
                    if (date_of_birth instanceof Date && !isNaN(date_of_birth)) { // Check if it's a valid Date object
                       const today = new Date();
                       age = today.getFullYear() - date_of_birth.getFullYear();
                       const m = today.getMonth() - date_of_birth.getMonth();
                       if (m < 0 || (m === 0 && today.getDate() < date_of_birth.getDate())) {
                           age--;
                       }
                       if (isNaN(age) || age < 0) age = null;
                    }
                } catch (dateError) {
                     console.error("Error processing date_of_birth object:", dateError);
                     age = null;
                }

                // Format date back to YYYY-MM-DD for SQL INSERT if needed
                const dobForSql = date_of_birth instanceof Date && !isNaN(date_of_birth)
                                  ? date_of_birth.toISOString().split('T')[0]
                                  : null;

                // Prepare SQL INSERT statement
                const insertSql = `INSERT INTO users (username, password, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth, age_in_years)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const insertParams = [
                    username, hashedPassword, email,
                    first_name, last_name, gender,
                    curr_weight, height_inches, goal_weight,
                    dobForSql, // Use formatted date
                    age
                ];

                // Execute the INSERT query
                const [insertResults] = await pool.execute(insertSql, insertParams);

                // --- Registration Successful ---
                console.log(`User '${username}' registered successfully. ID: ${insertResults.insertId}`);
                res.status(201).json({ success: true, message: 'User registered successfully' }); // 201 Created

            } catch (error) { // Catch errors during hashing or inserting
                console.error("Error during user insertion or hashing:", error);
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


// User Sign-In (Using pool.execute and async/await)
// Consider adding validation rules for signin too
app.post('/api/signin', /* Add signin validation rules here if desired */ async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        const sql = 'SELECT user_id, username, password, first_name, email FROM users WHERE username = ?'; // Select only needed fields
        const [results] = await pool.execute(sql, [username]);

        if (results.length === 0) {
            console.log(`Signin attempt failed: Username '${username}' not found.`);
            return res.status(401).json({ success: false, message: 'Invalid username or password' }); // 401 Unauthorized
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log(`User '${username}' signed in successfully.`);
            // Create JWT token
            const tokenPayload = { userId: user.user_id, username: user.username };
            const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });

            // Send back success, token, and non-sensitive user info
            res.json({
                success: true,
                token,
                user: {
                    userId: user.user_id,
                    username: user.username,
                    firstName: user.first_name
                }
             });
        } else {
            console.log(`Signin attempt failed: Incorrect password for username '${username}'.`);
            res.status(401).json({ success: false, message: 'Invalid username or password' }); // 401 Unauthorized
        }
    } catch (error) {
        console.error("Database error during signin:", error);
        res.status(500).json({ success: false, message: 'Server error during sign in.' });
    }
});

// Get All Users (Example - Remember to protect this endpoint)
app.get('/api/users', async (req, res) => {
    // WARNING: Protect this appropriately in a real application
    try {
        const [results] = await pool.query('SELECT user_id, username, email, first_name, last_name FROM users'); // Avoid selecting password hash
        res.json(results);
    } catch (error) {
        console.error("Database error getting users:", error);
        res.status(500).json({ success: false, message: 'Server error fetching users.' });
    }
});


// Start the server - ONLY if run directly
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${port} and accessible externally`);
    });
}

// Export the app object AND pool for testing purposes
module.exports = { app, pool };

