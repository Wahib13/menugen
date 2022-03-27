import express from 'express'
import http_status_codes from 'http-status-codes'
import Ajv from "ajv"

const createUSSDPageSchema = {
    type: "object",
    properties: {
        ussd_app_id: { type: "string" },
        name: { type: "string" },
        context: { type: "string" },
        prev_page_name: { type: "string" },
        next_page_name: { type: "string", nullable: true },
        type: { type: "string", enum: ["END", "CONTINUE"] }
    },
    required: ["ussd_app_id", "name", "context", "prev_page_name"],
    additionalProperties: false,
    anyOf: [
        {
            properties: {
                options: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            content: { type: "string" },
                            next_page_name: { type: "string" }
                        }
                    }
                }
            },
        }
    ]
}


const ajv_create_page = new Ajv()
const ussd_page_object_validator = ajv_create_page.compile(createUSSDPageSchema)

export const createUSSDPageValidator = (req: express.Request, res: express.Response, next: () => any) => {
    if (!ussd_page_object_validator(req.body)) {
        res.status(http_status_codes.BAD_REQUEST).send(ussd_page_object_validator.errors)
    }
    else {
        next()
    }
}

const updateUSSDPageSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        context: { type: "string" },
        type: { type: "string", enum: ["END", "CONTINUE"] }
    },
    required: [],
    additionalProperties: false
}

const ajv_update_page = new Ajv()
const ussd_page_update_object_validator = ajv_update_page.compile(updateUSSDPageSchema)

export const updateUSSDPageValidator = (req: express.Request, res: express.Response, next: () => any) => {
    if (!ussd_page_update_object_validator(req.body)) {
        res.status(http_status_codes.BAD_REQUEST).send(ussd_page_update_object_validator.errors)
    }
    else {
        next()
    }
}
