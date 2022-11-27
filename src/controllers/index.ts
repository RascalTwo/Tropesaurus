import { Request, Response } from "express";
import Trope, { ITrope } from "../models/Trope";
import Work from "../models/Work";

export async function renderHomepage(_: Request, res: Response) {
	const works = await Work.find();
	const tropes = (await Trope.find().populate<{ workCount: number }>('workCount')).sort((a, b) => b.workCount - a.workCount);
	res.render('index', { works, tropes });
}

export async function listTropes(req: Request<never, never, never, { workID: string }>, res: Response) {
	res.redirect(`/work/${req.query.workID}`);
}

export async function renderWork(req: Request<{ id: string }>, res: Response) {
	const work = await Work.findById(req.params.id).populate('tropes');
	res.render('work', { work });
}

export async function renderTrope(req: Request<{ id: string }>, res: Response) {
	const trope = await Trope.findById(req.params.id).populate('works', '_id title');
	res.render('trope', { trope });
}

export async function compareTropes(req: Request<never, never, never, { first: string, second: string }>, res: Response) {
	const first = (await Work.findById(req.query.first).populate<{ tropes: ITrope[] }>('tropes'))!;
	const second = (await Work.findById(req.query.second).populate<{ tropes: ITrope[] }>('tropes'))!;

	const firstTropes = new Set(first.tropes.map(t => t._id));
	const secondTropes = new Set(second.tropes.map(t => t._id));

	const inFirstOnly = first.tropes.filter(t => !secondTropes.has(t._id));
	const inSecondOnly = second.tropes.filter(t => !firstTropes.has(t._id));
	const inBoth = first.tropes.filter(t => secondTropes.has(t._id));

	res.render('compare-tropes', { first, second, tropes: { first: inFirstOnly, both: inBoth, second: inSecondOnly } });
}


export async function similarWorks(req: Request<never, never, never, { workID: string }>, res: Response) {
	const work = (await Work.findById(req.query.workID).populate<{ tropes: ITrope[] }>('tropes'))!;
	const similar = await Work.aggregate([
		{
			$match: {
				$and: [
					{ _id: { $ne: work._id } },
					{ tropes: { $in: work.tropes } }
				]
			}
		},
		{
			$addFields: {
				similarity: { $size: { $setIntersection: [work.tropes, "$tropes"] } }
			}
		}
	]).sort({ similarity: -1 });

	res.render('similar-works', { work, similar });
}

export async function search(req: Request<never, never, never, { mustHave: string[], canNotHave: string[] }>, res: Response) {
	const works = await Work.find({
		$and: [
			{ tropes: { $in: req.query.mustHave } },
			{ tropes: { $nin: req.query.canNotHave } }
		]
	});
	res.render('search', { works });
}