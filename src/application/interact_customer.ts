import { PageObjectService, SessionService, USSDAppObjectService } from "./ports";

export const getNextPage = async (
    session_id: string,
    customer: Customer,
    input: CustomerInput,
    sessionAdapter: SessionService,
    pageObjectAdapter: PageObjectService,
    USSDAppObjectAdapter: USSDAppObjectService
): Promise<USSDPage> => {

    let customer_session: CustomerSession | null = {
        customer: customer,
        session_id: session_id,
        shortcode: input.message,
        current_page_name: null
    }

    if (input.type !== 'INITIATE') {
        customer_session = await sessionAdapter.getSession(session_id) || null

        if (!customer_session) {
            throw Error(`session ${session_id} not found`)
        }

        const current_page_name = customer_session.current_page_name || null

        if (!current_page_name) {
            throw Error(`user session ${session_id} has no page name`)
        }

        customer_session.user_inputs = {
            ...customer_session.user_inputs,
            [current_page_name]: input.message
        }
    }

    let next_page_name: string | null = null

    if (input.type === 'INITIATE') {
        next_page_name = 'intro'
    } else {
        next_page_name = (await pageObjectAdapter.findPage(
            customer_session.shortcode,
            customer_session.current_page_name,
            USSDAppObjectAdapter)
            ).next_page_name
    }

    const next_page: USSDPage = await pageObjectAdapter.findPage(
        customer_session.shortcode,
        next_page_name,
        USSDAppObjectAdapter)

    sessionAdapter.storeSession({...customer_session, current_page_name: next_page.name})

    return next_page
}
