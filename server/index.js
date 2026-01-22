import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from './auth.js';
import {
    getExpenses, addExpense, deleteExpense, updateExpense,
    getAllBudgets, updateUserBudget,
    getRecurringExpenses, addRecurringExpense, deleteRecurringExpense
} from './database.js';
import { startBot } from './bot.js';
import { startScheduler } from './scheduler.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

// 1. Secure Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: isProduction, // Enable in production
    crossOriginEmbedderPolicy: false
}));

// 2. Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit login attempts
    message: 'Too many login attempts, please try again later.'
});
app.use('/auth/', authLimiter);

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction, // Auto-enable for production
        httpOnly: true, // Prevents XSS theft
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: isProduction ? 'strict' : 'lax' // Stricter in production
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth Middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized' });
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) return next();
    res.status(403).json({ error: 'Forbidden' });
};

// Auth Routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: `${FRONTEND_URL}?error=login_failed` }),
    (req, res) => {
        res.redirect(FRONTEND_URL);
    }
);

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect(FRONTEND_URL);
    });
});

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            authenticated: true,
            user: req.user
        });
    } else {
        res.json({ authenticated: false });
    }
});

// API Routes (Protected)

app.get('/api/expenses', isAuthenticated, async (req, res) => {
    try {
        const expenses = await getExpenses();
        const budgets = await getAllBudgets();

        if (req.user.isAdmin) {
            res.json({ expenses, budgets });
        } else {
            const userExpenses = expenses.filter(e => e.userId === req.user.id);
            const userBudget = budgets.filter(b => b.userId === req.user.id);
            res.json({ expenses: userExpenses, budgets: userBudget });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/expenses', isAuthenticated, async (req, res) => {
    try {
        const expenseData = {
            ...req.body,
            userId: req.user.id,
            username: req.user.username
        };
        const newExpense = await addExpense(expenseData);
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/expenses/:id', isAuthenticated, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            const allExpenses = await getExpenses();
            const targetExpense = allExpenses.find(e => e.id === req.params.id);

            if (!targetExpense) {
                return res.status(404).json({ error: 'Expense not found' });
            }

            if (targetExpense.userId !== req.user.id) {
                return res.status(403).json({ error: 'You do not have permission to delete this expense.' });
            }
        }

        await deleteExpense(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/expenses/:id', isAuthenticated, async (req, res) => {
    try {
        const allExpenses = await getExpenses();
        const targetExpense = allExpenses.find(e => e.id === req.params.id);

        if (!targetExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        if (!req.user.isAdmin && targetExpense.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to edit this expense.' });
        }

        const { amount, category, title, date, receiptUrl } = req.body;
        await updateExpense(req.params.id, { amount, category, title, date, receiptUrl });
        res.status(200).json({ success: true, id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/budget', isAuthenticated, async (req, res) => {
    try {
        let { userId, username, amount } = req.body;

        if (!req.user.isAdmin) {
            userId = req.user.id;
            username = req.user.username;
        }

        await updateUserBudget(userId || 'admin', username || 'Admin', amount);
        res.status(200).json({ success: true, budget: amount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Recurring Expenses Routes
app.get('/api/recurring', isAuthenticated, async (req, res) => {
    try {
        const allRecurring = await getRecurringExpenses();
        if (req.user.isAdmin) {
            res.json(allRecurring);
        } else {
            const userRecurring = allRecurring.filter(r => r.userId === req.user.id);
            res.json(userRecurring);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/recurring', isAuthenticated, async (req, res) => {
    try {
        const expenseData = {
            ...req.body,
            userId: req.user.id,
            username: req.user.username
        };
        const newRecurring = await addRecurringExpense(expenseData);
        res.status(201).json(newRecurring);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/recurring/:id', isAuthenticated, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            const allRecurring = await getRecurringExpenses();
            const target = allRecurring.find(r => r.id === req.params.id);
            if (!target) return res.status(404).json({ error: 'Not found' });
            if (target.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
        }
        await deleteRecurringExpense(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Discord Bot
startBot();
startScheduler();

// Configure Multer for file uploads
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)!'));
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// File Upload Endpoint
app.post('/api/upload', upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL relative to the server
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
