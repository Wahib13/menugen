import express from 'express'
import passport from 'passport'
import { Strategy, StrategyOptions } from 'passport-jwt'
import { ExtractJwt } from 'passport-jwt'
import { UserObjectAdapter } from '../adapters/user_objects_adapter'
import { login, registerUser, showAllUsers, showUser } from '../controllers/user_controller'
import { createUserValidator } from '../controllers/validators/user_validator'


const loginRequiredMiddleware = passport.authenticate('jwt', { session: false })

export const user_routes = express.Router()

// user_routes.route('/').get(loginRequiredMiddleware, showAllUsers)
user_routes.route('/').post(createUserValidator, registerUser)
user_routes.route('/:id').get(loginRequiredMiddleware, showUser)
user_routes.route('/auth').post(login)