import express from 'express'
import passport from 'passport'
import { addUSSDPage, deleteUSSDPage, showUSSDPage, showUSSDPages, updateUSSDPage } from '../controllers/ussd_page_controller'
import { createUSSDPageValidator } from '../controllers/validators/ussd_page_validator'


const loginRequiredMiddleware = passport.authenticate('jwt', { session: false })

export const ussd_page_routes = express.Router()

ussd_page_routes.use(loginRequiredMiddleware)

ussd_page_routes.route('/').get(showUSSDPages)
ussd_page_routes.route('/').post(createUSSDPageValidator, addUSSDPage)
ussd_page_routes.route('/:ussd_app_id/:ussd_page_name').get(showUSSDPage).put(updateUSSDPage).delete(deleteUSSDPage)