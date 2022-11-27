import fs from 'fs';
import path from 'path';

import fetch, { RequestInit } from 'node-fetch';
import { JSDOM } from 'jsdom';
import Work from '../models/Work';
import Trope from '../models/Trope';
import connectToDatabase from '../config/database';

const BASE_URL = 'https://tvtropes.org/pmwiki/pmwiki.php/';

const CACHE_ROOT = path.join('cache');

const CATEGORIES = ['Film', 'WesternAnimation', 'Animation', 'Anime', 'Series']

async function cacheThenFetch(url: string, slug: string, init?: RequestInit){
	const cachePath = path.join(CACHE_ROOT, slug + '.html');
	if(fs.existsSync(cachePath)){
		return fs.promises.readFile(cachePath, 'utf8');
	}

	const response = await fetch(url, init);
	const html = await response.text();
	await fs.promises.writeFile(cachePath, html, 'utf8');
	return html;
}

async function getWorkInfo(_id: string){
	const [category, slug] = _id.split('/');
	const html = await cacheThenFetch(BASE_URL + _id, 'work-' + category + '-' + slug);
	const { window: { document } } = new JSDOM(html);

	const title = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content;
	const imageURL = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')!.content;

	const tropes = [];
	for (const selector of [
		'#main-article .folder > ul > li > a:first-child',
		'#main-article > ul > li > a:first-child'
	]) {
		const anchors = document.querySelectorAll<HTMLAnchorElement>(selector);
		if (!anchors.length) continue;

		for (const anchor of anchors) {
			tropes.push({ _id: anchor.href.split('/').at(-1)!, name: anchor.textContent! })
		}

		break;
	}

	return {
		_id,
		title,
		imageURL,
		tropes
	}
}

async function main(){
	const conn = await connectToDatabase();
	for (const workID of ['Film/IndependenceDay', 'Film/IndependenceDayResurgence', 'Film/WhenTimeGotLouder', 'Anime/TengenToppaGurrenLagann', 'Film/FightClub']){
		const work = await getWorkInfo(workID);
		console.log(work.title);
		const existingWork = await Work.findById(work._id);
		if (!existingWork) await Work.create(work);
		else {
			const newIDs = work.tropes.map(t => t._id);
			if (existingWork.tropes.length !== newIDs.length || existingWork.tropes.some((id, i) => id !== newIDs[i]) || existingWork.title !== work.title || existingWork.imageURL !== work.imageURL) {
				existingWork.tropes = newIDs;
				existingWork.title = work.title;
				existingWork.imageURL = work.imageURL;
				await existingWork.save();
			}
		}

		for (const trope of work.tropes){
			const existingTrope = await Trope.findById(trope._id);
			if (!existingTrope) await Trope.create(trope);
		}
	}
	return conn.disconnect();
}
main().catch(console.error);