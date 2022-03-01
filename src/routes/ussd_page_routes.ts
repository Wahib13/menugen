import express from 'express'
import passport from 'passport'
import { addUSSDPage } from '../controllers/ussd_page_controller'
import { createUSSDPageValidator } from '../controllers/validators/ussd_page_validator'


const loginRequiredMiddleware = passport.authenticate('jwt', { session: false })

export const ussd_page_routes = express.Router()

ussd_page_routes.route('/').post(loginRequiredMiddleware, createUSSDPageValidator, addUSSDPage)
// ussd_app_routes.route('/:id').get(loginRequiredMiddleware, showUSSDApp)