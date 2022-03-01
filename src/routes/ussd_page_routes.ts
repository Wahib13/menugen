import express from 'express'
import passport from 'passport'
import { addUSSDPage } from '../controllers/ussd_page_controller'


const loginRequiredMiddleware = passport.authenticate('jwt', { session: false })

export const ussd_page_routes = express.Router()

ussd_page_routes.route('/').post(loginRequiredMiddleware, addUSSDPage)
// ussd_app_routes.route('/:id').get(loginRequiredMiddleware, showUSSDApp)