import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
//import readdir from 'fs';
import { readdirSync } from 'fs';
import { initSocket } from './config/socket';
import http from 'http';

// import { userRoutes } from './routes/user.routes';
// import { roomRoutes } from './routes/room.routes';

const callOption = {
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific HTTP methods
    credential: true
}

dotenv.config();
const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(morgan('dev')); // Logging middleware
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(cors(callOption));
app.use(express.json());

// Routes
//readdir
readdirSync('./src/routes').map((file) => app.use('/api', require(`./routes/${file}`).default));





export default app;
