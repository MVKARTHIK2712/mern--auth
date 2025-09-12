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


app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://mern-auth-frontend-6ums.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (curl, mobile apps, Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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
