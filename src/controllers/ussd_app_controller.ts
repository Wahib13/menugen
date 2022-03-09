import express from 'express'
import { USSDAppObjectAdapter } from '../adapters/ussd_app_objects_adapter'
import { createUSSDApp, getUSSDApp, getUSSDApps } from '../application/crud_ussd_app'
import http_status_codes from 'http-status-codes'
import { USSDPageObjectsAdapter } from '../adapters/ussd_page_objects_adapter'

export const showUSSDApp = async (req: express.Request, res: express.Response) => {
    const id = req.params.id
    try {
        const ussd_app = await getUSSDApp(id, USSDAppObjectAdapter())
        res.status(http_status_codes.OK).send(ussd_app)
    } catch (error) {
        // todo custom errors
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({error: `internal error`})        
    }
}

export const showUSSDApps = async (req: express.Request, res: express.Response) => {
    try {
        const ussd_apps = await getUSSDApps(USSDAppObjectAdapter())
        res.status(http_status_codes.OK).send(ussd_apps)
    } catch (error) {
        // todo custom errors
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({error: `internal error`})        
    }
}

export const addUSSDApp = async (req: express.Request, res: express.Response) => {
    const new_ussd_app: USSDApp = {
        shortcode: req.body.shortcode,
        name: req.body.name
    }
    try {
        const ussd_app: USSDApp | null = await createUSSDApp(
            new_ussd_app,
            USSDAppObjectAdapter(),
            USSDPageObjectsAdapter()
        )
        if (!ussd_app) {
            throw Error('USSD app creation failed')
        }
        res.status(http_status_codes.CREATED).send(ussd_app)
    } catch (error) {
        // todo custom errors
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({error: `internal error`})
    }
}
