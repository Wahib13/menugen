import express from 'express'
import passport from 'passport'
import { addUSSDApp, showUSSDApp } from '../controllers/ussd_app_controller'


const loginRequiredMiddleware = passport.authenticate('jwt', { session: false })

export const ussd_app_routes = express.Router()

ussd_app_routes.route('/').post(loginRequiredMiddleware, addUSSDApp)
ussd_app_routes.route('/:id').get(loginRequiredMiddleware, showUSSDApp)