// backend/__tests__/auth.test.js

const request = require('supertest'); // Keep this line

// Use this single line to import both app and pool from server.js:
const { app, pool } = require('../server');

// Use a unique suffix for test users to avoid collisions and allow cleanup
const testSuffix = Date.now();
const uniqueUsername = `testuser_${testSuffix}`;
const uniqueEmail = `test_${testSuffix}@example.com`;
const duplicateUsername = 'test_duplicate_user'; // Assume this user will be created once

// Increase Jest timeout for async operations if needed (e.g., 10 seconds)
// jest.setTimeout(10000);

// Describe block groups related tests
describe('Authentication API Endpoints', () => {

    // Optional: Clean up database before/after tests if needed
    // This is complex - requires careful handling of test data
    // For now, we rely on unique usernames/emails for success tests
    // and pre-existing data (like 'spiderman' or creating one below) for duplicate tests.

    // --- Registration Tests (/api/register) ---
    describe('POST /api/register', () => {

        // Test Case: Successful registration with new unique data
        it('should register a new user successfully with valid data', async () => {
            const response = await request(app) // Use supertest to make request to our app
                .post('/api/register')
                .send({ // Send registration data in the request body
                    username: uniqueUsername,
                    password: 'Password123!',
                    password_confirmation: 'Password123!', // Ensure this matches the password
                    email: uniqueEmail,
                    first_name: 'Test',
                    last_name: 'User',
                    gender: 'Male', // Ensure this matches ENUM ('Male', 'Female', 'Other')
                    curr_weight: 150.5,
                    height_inches: 70,
                    goal_weight: 145.0,
                    date_of_birth: '1995-05-15'
                });

            // Assertions: Check the response
            expect(response.statusCode).toBe(201); // Expect '201 Created' status
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
        });

        // Test Case: Attempt registration with a duplicate username
        // We need to ensure a user exists first for this test. Let's try registering one.
        // Note: Running tests in parallel might cause issues here. Jest runs sequentially by default in a file.
        beforeAll(async () => {
             // Ensure the duplicate user exists for the test below
             // This runs once before all tests in this describe block
             try {
                await request(app)
                    .post('/api/register')
                    .send({
                        username: duplicateUsername, // User to cause conflict
                        password: 'Password123!',
                        password_confirmation: 'Password123!', // Ensure this matches the password
                        email: `duplicate_${testSuffix}@example.com`, // Unique email
                        first_name: 'Duplicate', last_name: 'Test', gender: 'Female',
                        curr_weight: 130, height_inches: 65, goal_weight: 125, date_of_birth: '1998-01-01'
                    });
             } catch (error) {
                // Ignore errors here, maybe the user already exists from a previous run
                // console.log("Note: Error creating duplicate user for test setup, might already exist.", error.message);
             }
        });

        it('should return 409 Conflict for duplicate username', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({
                    username: duplicateUsername, // Use the username we know exists
                    password: 'AnotherPassword1!',
                    password_confirmation: 'AnotherPassword1!', // Ensure this matches the password
                    email: `another_unique_${testSuffix}@example.com`, // Different email
                    first_name: 'Another', last_name: 'User', gender: 'Male',
                    curr_weight: 160, height_inches: 72, goal_weight: 155, date_of_birth: '1990-10-10'
                });

            expect(response.statusCode).toBe(409); // Expect '409 Conflict' status
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/Username or Email already exists/i); // Check message contains expected text
        });

         // Test Case: Attempt registration with a duplicate email
         it('should return 409 Conflict for duplicate email', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({
                    username: `another_unique_user_${testSuffix}`, // Different username
                    password: 'Password123!',
                    password_confirmation: 'Password123!', // Ensure this matches the password
                    email: `duplicate_${testSuffix}@example.com`, // Use the email we know exists
                    first_name: 'Another', last_name: 'EmailTest', gender: 'Female',
                    curr_weight: 135, height_inches: 66, goal_weight: 130, date_of_birth: '1999-02-02'
                });

            expect(response.statusCode).toBe(409); // Expect '409 Conflict' status
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/Username or Email already exists/i);
        });


        // Test Case: Attempt registration with missing required field (e.g., password)
        it('should return 400 Bad Request for missing password', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({ // Payload MISSING password
                    username: `missing_pw_${testSuffix}`,
                    email: `missing_pw_${testSuffix}@example.com`,
                    first_name: 'Missing', last_name: 'Password', gender: 'Male',
                    curr_weight: 150, height_inches: 70, goal_weight: 145, date_of_birth: '1995-05-15'
                });

            expect(response.statusCode).toBe(400); // Expect '400 Bad Request'
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Password must be at least 8 characters long.');
        });

    // Test Case: Current Weight exceeds maximum
    it('should return 400 Bad Request for current weight exceeding limit', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                username: `weight_test_${testSuffix}`, // Unique username
                password: 'Password123!',
                password_confirmation: 'Password123!', // Ensure this matches the password
                email: `weight_test_${testSuffix}@example.com`, // Unique email
                first_name: 'Weight', last_name: 'Test', gender: 'Male',
                curr_weight: 1000, // Value at or exceeding the limit (lt: 1000)
                height_inches: 70,
                goal_weight: 150,
                date_of_birth: '1995-01-01'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        // Check against the updated message in your server.js rule
        expect(response.body.message).toBe('Current Weight must be a positive number less than 1000.');
    });

    // Test Case: Goal Weight exceeds maximum
    it('should return 400 Bad Request for goal weight exceeding limit', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                username: `goal_weight_test_${testSuffix}`, // Unique username
                password: 'Password123!',
                password_confirmation: 'Password123!', // Ensure this matches the password
                email: `goal_weight_test_${testSuffix}@example.com`, // Unique email
                first_name: 'GoalWeight', last_name: 'Test', gender: 'Female',
                curr_weight: 150,
                height_inches: 65,
                goal_weight: 1000.00, // Value at or exceeding the limit (lt: 1000)
                date_of_birth: '1996-02-02'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        // Check against the updated message in your server.js rule
        expect(response.body.message).toBe('Goal Weight must be a positive number less than 1000.');
    });

    // Test Case: Height exceeds maximum (using your limit of 300)
    it('should return 400 Bad Request for height exceeding limit', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                username: `height_test_${testSuffix}`, // Unique username
                password: 'Password123!',
                password_confirmation: 'Password123!', // Ensure this matches the password
                email: `height_test_${testSuffix}@example.com`, // Unique email
                first_name: 'Height', last_name: 'Test', gender: 'Other',
                curr_weight: 200,
                height_inches: 300, // Value at or exceeding the limit (lt: 300)
                goal_weight: 190,
                date_of_birth: '1997-03-03'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        // Check against the updated message in your server.js rule (adjust if you used a different message)
        expect(response.body.message).toBe('Height must be a positive whole number less than 300 inches.');
    });





    });

    // --- Signin Tests (/api/signin) ---
    describe('POST /api/signin', () => {

        // Test Case: Successful login
        it('should login successfully with correct credentials', async () => {
            // Assumes 'uniqueUsername' was successfully created in the registration test above
            const response = await request(app)
                .post('/api/signin')
                .send({
                    username: uniqueUsername,
                    password: 'Password123!' // The password used during registration
                });

            expect(response.statusCode).toBe(200); // Expect '200 OK'
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token'); // Check if token exists
            expect(response.body.user.username).toBe(uniqueUsername);
        });

        // Test Case: Login with incorrect password
        it('should return 401 Unauthorized for incorrect password', async () => {
             const response = await request(app)
                .post('/api/signin')
                .send({
                    username: uniqueUsername, // Correct username
                    password: 'WrongPassword!' // Incorrect password
                });

            expect(response.statusCode).toBe(401); // Expect '401 Unauthorized'
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid username or password');
        });

         // Test Case: Login with non-existent username
        it('should return 401 Unauthorized for non-existent username', async () => {
             const response = await request(app)
                .post('/api/signin')
                .send({
                    username: `non_existent_user_${testSuffix}`, // User that doesn't exist
                    password: 'Password123!'
                });

            expect(response.statusCode).toBe(401); // Expect '401 Unauthorized'
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid username or password');
        });

         // Test Case: Login with missing field
        it('should return 400 Bad Request for missing password', async () => {
             const response = await request(app)
                .post('/api/signin')
                .send({
                    username: uniqueUsername // Missing password
                });

            expect(response.statusCode).toBe(400); // Expect '400 Bad Request'
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Username and password are required.');
        });

    });

    // Optional: Cleanup after tests
    // This is important to avoid polluting your database during tests
    afterAll(async () => {
        // Delete the users created during testing
        // Note: This requires the 'pool' object to be correctly imported and functional
        if (pool && pool.execute) { // Check if pool seems valid before using
            try {
                const cleanupSql = "DELETE FROM users WHERE username LIKE 'testuser_%' OR username = ? OR username LIKE 'another_unique_user_%' OR username LIKE 'missing_pw_%' OR email LIKE 'duplicate_%'";
                await pool.execute(cleanupSql, [duplicateUsername]); // Pass duplicateUsername as parameter
                console.log("\nTest users cleaned up.");
            } catch (error) {
                console.error("\nError cleaning up test users:", error.message);
            }
            // Close the database connection pool if it was imported for cleanup
             try {
                await pool.end();
                console.log("Database pool closed.");
             } catch (endError) {
                 console.error("Error closing database pool:", endError.message);
             }
        } else {
             console.warn("\nDatabase pool not available for cleanup. Skipping cleanup.");
        }
    });

});
