import express from 'express'
import { USSDAppObjectAdapter } from '../adapters/ussd_app_objects_adapter'
import { createUSSDApp, getUSSDApp } from '../application/crud_ussd_app'
import http_status_codes from 'http-status-codes'

export const showUSSDApp = async (req: express.Request, res: express.Response) => {
    const id = req.params.id
    const ussd_app = await getUSSDApp(id, USSDAppObjectAdapter())
    res.status(200).send(ussd_app)
}

export const addUSSDApp = async (req: express.Request, res: express.Response) => {
    const new_ussd_app: USSDApp = {
        shortcode: req.body.shortcode,
        name: req.body.name
    }
    try {
        const ussd_app: USSDApp | null = await createUSSDApp(new_ussd_app, USSDAppObjectAdapter())
        if (!ussd_app) {
            throw Error('USSD app creation failed')
        }
        res.send(http_status_codes.CREATED).send(ussd_app)
    } catch (error) {
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR)
    }
}