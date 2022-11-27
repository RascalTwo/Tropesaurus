import Router from 'express-promise-router'
import * as controller from '../controllers/index'

const router = Router()

router.get('/', controller.renderHomepage)
router.get<never, string, never, { workID: string }>('/list-tropes', controller.listTropes)
router.get<{ id: string }>('/work/:id(*)', controller.renderWork)
router.get<{ id: string }>('/trope/:id', controller.renderTrope)
router.get<never, string, never, { first: string, second: string }>('/compare-tropes', controller.compareTropes)
router.get<never, string, never, { workID: string }>('/similar-works', controller.similarWorks)
router.get<never, string, never, { mustHave: string[], canNotHave: string[] }>('/search', controller.search)

export default router