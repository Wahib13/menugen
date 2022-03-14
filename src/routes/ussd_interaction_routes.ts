import express from 'express'
import xml_parser from 'express-xml-bodyparser'
import { handleUSSDPull } from '../controllers/ussd_interaction_controller'
import { xmlValidationMiddleware } from '../controllers/validators/ussd_interaction_validator'

export const ussd_interaction_router = express.Router()

ussd_interaction_router.use(xml_parser({
    normalizeTags: false
}))

ussd_interaction_router.post('/', xmlValidationMiddleware, handleUSSDPull)
