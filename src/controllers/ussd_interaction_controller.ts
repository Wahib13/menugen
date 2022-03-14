import express from 'express'
import { SessionAdapter } from '../adapters/session_adapter'
import { USSDPageObjectsAdapter } from '../adapters/ussd_page_objects_adapter'
import { getDefaultErrorFeedback, getNextFeedbackPage } from '../application/interact_customer'
import fs from 'fs'
import path from 'path'
import Mustache from 'mustache'
import { USSDAppObjectAdapter } from '../adapters/ussd_app_objects_adapter'

export const handleUSSDPull = async (req: express.Request, res: express.Response) => {
    try {
        const redisAdapter = SessionAdapter()
        const pageObjectsAdapter = USSDPageObjectsAdapter()
        const ussdAppObjectsAdapter = USSDAppObjectAdapter()


        const ussd = req.body.ussd
        const customer: Customer = { msisdn: ussd.msisdn[0] }
        const message: string = ussd.msg[0]
        const session_id: string = ussd.sessionid[0]
        const type: string = ussd.type[0]


        const customer_input: CustomerInput = {
            message: message,
            type: type == '1' ? 'INITIATE' : 'CONTINUE'
        }


        let feedback_page: CustomerFeedbackPage = await getDefaultErrorFeedback(pageObjectsAdapter, customer)
        try {
            feedback_page = await getNextFeedbackPage(
                session_id,
                customer,
                customer_input,
                redisAdapter,
                pageObjectsAdapter,
                ussdAppObjectsAdapter
            )
        } catch (error) {
            console.log(error)
        }

        fs.readFile(path.join(__dirname, '../../templates/responses/ussd.xml'), 'utf-8', (err, template) => {
            const view = {
                msisdn: customer.msisdn,
                sessionid: session_id,
                type: feedback_page.type === 'CONTINUE' ? 2 : 3,
                msg: feedback_page.content
            }

            res.set('Content-Type', 'text/xml')
            res.status(200).send(Mustache.render(template, view))
        })



    } catch (error) {
        console.log(error)
        res.status(500)
    }
}