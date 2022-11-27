import mongoose from 'mongoose';

export interface ITrope {
	_id: string;
	name: string;
}

const TropeSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
});
TropeSchema.virtual('works', {
	ref: 'Work',
	localField: '_id',
	foreignField: 'tropes',
});
TropeSchema.virtual('workCount', {
	ref: 'Work',
	localField: '_id',
	foreignField: 'tropes',
	count: true,
});

export default mongoose.model<ITrope>('Trope', TropeSchema);