import Ajv from "ajv";
import express from 'express'

const USSDSchema = {
    type: "object",
    properties: {
        ussd: {
            type: "object",
            properties:
            {
                msisdn: { type: "array", minItems: 1, maxItems: 1, items: { type: "string" } },
                sessionid: { type: "array", minItems: 1, maxItems: 1, items: { type: "string" } },
                type: { type: "array", minItems: 1, maxItems: 1, items: { type: "string" }, enum: [["1"], ["2"]] },
                msg: { type: "array", minItems: 1, maxItems: 1, items: { type: "string" } }
            },
            required: ["msisdn", "sessionid", "type", "msg"],
            additionalProperties: true
        }
    },
    required: ["ussd"],
    additionalProperties: false
}

const xml_validator = new Ajv().compile(USSDSchema)
export const xmlValidationMiddleware = (req: express.Request, res: express.Response, next: () => any) => {
    if (!xml_validator(req.body)) {
        res.status(400).send(xml_validator.errors)
    } else {
        next()
    }
}