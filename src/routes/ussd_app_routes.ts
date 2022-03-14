import express from 'express'
import passport from 'passport'
import { addUSSDApp, showUSSDApp, showUSSDApps } from '../controllers/ussd_app_controller'
import { createUSSDAppValidator } from '../controllers/validators/ussd_app_validator'


const loginRequiredMiddleware = passport.authenticate('jwt', { session: false })

export const ussd_app_routes = express.Router()

ussd_app_routes.use(loginRequiredMiddleware)

ussd_app_routes.route('/').get(showUSSDApps)
ussd_app_routes.route('/').post(createUSSDAppValidator, addUSSDApp)
ussd_app_routes.route('/:id').get(showUSSDApp)