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

// Get current points
app.get('/point', (req, res) => {
    const sql = 'SELECT Points_Earned FROM activitylog WHERE LogID = 1';
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching score:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        res.json({ success: true, total: results[0].total });
    });
});

// Add points (1, 5, or 10)
app.post('/add', (req, res) => {
    const { amount } = req.body; // e.g., { amount: 5 }

    if (![1, 5, 10].includes(amount)) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const sql = 'UPDATE activitylog SET Points_Earned = total + ? WHERE LogID = 1';

    db.query(sql, [amount], (err) => {
        if (err) {
            console.error("Error updating score:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        // send back updated total
        db.query('SELECT Points_Earned FROM activitylog WHERE LogID = 1', (err, results) => {
            if (err) {
                console.error("Error fetching updated score:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            res.json({ success: true, total: results[0].total });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
