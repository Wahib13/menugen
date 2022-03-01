import express from 'express'
import { USSDAppObjectAdapter } from '../adapters/ussd_app_objects_adapter'
import { USSDPageObjectsAdapter } from '../adapters/ussd_page_objects_adapter'
import { createUSSDPage } from '../application/crud_ussd_page'
import http_status_codes from 'http-status-codes'

export const addUSSDPage = async (req: express.Request, res: express.Response) => {
    const new_ussd_page: USSDPage = {
        id: null,
        context: req.body.context,
        name: req.body.name,
        type: req.body.type || 'END',
        ussd_app_id: req.body.ussd_app_id,
        prev_page_name: req.body.prev_page_name,
        next_page_name: null
    }
    try {
        const created_ussd_page: USSDPage | null = await createUSSDPage(
            new_ussd_page,
            USSDPageObjectsAdapter(),
            USSDAppObjectAdapter(),
        )
        if (!created_ussd_page) {
            throw Error('USSD page creation failed')
        }
        res.status(http_status_codes.CREATED).send(created_ussd_page)
    } catch (error) {
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({error: `internal error`})
    }
}