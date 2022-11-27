import mongoose from 'mongoose';
import { MONGO_URI } from './constants';
import '../models/Work';
import '../models/Trope';

export default async function connectToDatabase(){
	console.log('Connecting to database...');
	const conn = await mongoose.connect(MONGO_URI);
	console.log(`Connected to ${mongoose.connection.host}`);
	return conn;
}