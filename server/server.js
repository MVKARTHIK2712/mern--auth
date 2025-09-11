import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { connect } from 'mongoose';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';


const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins=['https://mern-auth-frontend-6ums.onrender.com']

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  credentials: true,
}));

//api end pointss
app.get('/', (req, res) => {res.send('api working karthik!');});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
