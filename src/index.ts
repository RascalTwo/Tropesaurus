import express from 'express';
import connectToDatabase from './config/database';
import indexRouter from './routes/index';
import { PORT } from './config/constants';

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use('/', indexRouter);

connectToDatabase().then(() =>
	app.listen(PORT, () => {
		console.log(`Server listening at http://localhost:${PORT}/`);
	})
)