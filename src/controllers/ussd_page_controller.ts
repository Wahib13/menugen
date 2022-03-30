import express from 'express'
import { USSDAppObjectAdapter } from '../adapters/ussd_app_objects_adapter'
import { USSDPageObjectsAdapter } from '../adapters/ussd_page_objects_adapter'
import { createUSSDPage, deletePage, getUSSDPage, getUSSDPages, updatePage } from '../application/crud_ussd_page'
import http_status_codes from 'http-status-codes'

export const addUSSDPage = async (req: express.Request, res: express.Response) => {
    const new_ussd_page: USSDPage = {
        context: req.body.context,
        name: req.body.name,
        options: req.body.options,
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
        // todo custom descriptive errors
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({ error: `internal error` })
    }
}

export const showUSSDPages = async (req: express.Request, res: express.Response) => {
    const { app_id } = req.query
    try {
        if (!app_id) {
            throw Error('app_id undefined')
        }
        const ussd_pages: USSDPage[] = await getUSSDPages(String(app_id), USSDPageObjectsAdapter())
        res.status(http_status_codes.OK).send(ussd_pages)
    } catch (error) {
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send()
    }

}

export const showUSSDPage = async (req: express.Request, res: express.Response) => {
    try {
        const ussd_page = await getUSSDPage(req.params.id, USSDPageObjectsAdapter())
        if (!ussd_page) {
            throw Error('USSD page not found')
        }
        res.status(http_status_codes.OK).send(ussd_page)
    } catch (error) {
        console.log(error)
        // todo custom descriptive errors
        res.status(http_status_codes.NOT_FOUND).send({ error: 'USSD page not found' })
        // res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({ error: `internal error` })
    }
}

export const updateUSSDPage = async (req: express.Request, res: express.Response) => {
    try {
        const page_update: USSDPageUpdate = { ...req.body }
        const updated_ussd_page = await updatePage(req.params.id, page_update, USSDPageObjectsAdapter(), USSDAppObjectAdapter())
        if (!updated_ussd_page) {
            throw Error('USSD Page update failed')
        }
        res.status(http_status_codes.OK).send(updated_ussd_page)
    } catch (error) {
        console.log(error)
        // todo custom descriptive errors
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({ error: `internal error` })
    }
}

export const deleteUSSDPage = async (req: express.Request, res: express.Response) => {
    try {
        const delete_page_result = await deletePage(req.params.id, USSDPageObjectsAdapter())
        if (!delete_page_result) {
            throw Error(`page id ${req.params.id} not found`)
        }
        res.status(http_status_codes.OK).send()
    } catch (error) {
        console.log(error)
        // todo custom descriptive errors
        res.status(http_status_codes.NOT_FOUND).send()
        // res.status(http_status_codes.INTERNAL_SERVER_ERROR).send({ error: `internal error` })
    }
}