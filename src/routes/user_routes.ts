import express from 'express'
import passport from 'passport'
import { login, registerUser, showUser } from '../controllers/user_controller'
import { createUserValidator } from '../controllers/validators/user_validator'


const loginRequiredMiddleware = passport.authenticate('jwt', { session: false })

export const user_routes = express.Router()

// user_routes.route('/').get(loginRequiredMiddleware, showAllUsers)
user_routes.route('/').post(createUserValidator, registerUser)
user_routes.route('/:id').get(showUser)
user_routes.route('/auth').post(login)