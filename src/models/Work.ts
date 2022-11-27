import mongoose from 'mongoose';

export interface IWork {
	_id: string;
	title: string;
	imageURL: string;
	tropes: string[];
}

const WorkSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	imageURL: {
		type: String,
		required: true,
	},
	tropes: {
		type: [{
			ref: 'Trope',
			type: String
		}],
		required: true,
	}
});

export default mongoose.model<IWork>('Work', WorkSchema);