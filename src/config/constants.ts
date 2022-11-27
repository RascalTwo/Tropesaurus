
import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 1337;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tropesaurus';