import express from 'express'
import http_status_codes from 'http-status-codes'
import Ajv from "ajv"

const createUSSDAppSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        shortcode: { type: "string" }
    },
    required: ["name", "shortcode"],
    additionalProperties: false
}


const ajv_create_page = new Ajv()
const ussd_app_object_validator = ajv_create_page.compile(createUSSDAppSchema)

export const createUSSDAppValidator = (req: express.Request, res: express.Response, next: () => any) => {
    if (!ussd_app_object_validator(req.body)) {
        res.status(http_status_codes.BAD_REQUEST).send(ussd_app_object_validator.errors)
    }
    else {
        next()
    }
}
