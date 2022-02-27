import express from 'express'
import http_status_codes from 'http-status-codes'
import Ajv from "ajv"
import addFormats from 'ajv-formats'

const createUserSchema = {
    type: "object",
    properties: {
        username: { type: "string" },
        email: { type: "string", format: "email" },
        password: { type: "string" }
    },
    required: ["username", "email", "password"],
    additionalProperties: false
}

const ajv = new Ajv()
addFormats(ajv)
const user_object_validator = ajv.compile(createUserSchema)

export const createUserValidator = (req: express.Request, res: express.Response, next: () => any) => {
    if (!user_object_validator(req.body)) {
        res.status(http_status_codes.BAD_REQUEST).send(user_object_validator.errors)
    }
    else {
        next()
    }
}