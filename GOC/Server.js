import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";


dotenv.config();
const app = express();
const PORT = 3300;

app.use(express.static('Public')); 
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Test connection
db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to server successfully!");
});

// POST 
app.post('/login', (req, res) => {
    const { CWS_ID, password } = req.body;

    if (!CWS_ID || !password) {
        return res.status(400).json({ success: false, message: 'Missing credentials' });
    }
    //Login 
    const sql = 'SELECT * FROM employee WHERE CWS_ID = ? AND Password = ?';
    db.query(sql, [CWS_ID, password], (err, results) => {
        if (err) {
            console.error('Error during query:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid CWS or password' });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
