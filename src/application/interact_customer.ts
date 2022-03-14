import { PageObjectService, SessionService, USSDAppObjectService } from "./ports";

export const getNextFeedbackPage = async (
    session_id: string,
    customer: Customer,
    input: CustomerInput,
    sessionAdapter: SessionService,
    pageObjectAdapter: PageObjectService,
    USSDAppObjectAdapter: USSDAppObjectService
): Promise<CustomerFeedbackPage> => {

    let customer_session: CustomerSession | null = null

    if (input.type === 'INITIATE') {

        const shortcode = input.message
        customer_session = {
            customer: customer,
            session_id: session_id,
            shortcode: shortcode,
            current_page_name: null
        }
        const ussd_app: USSDApp | null = await USSDAppObjectAdapter.queryUSSDApp({ shortcode: shortcode })
        if (!ussd_app) {
            throw Error(`USSD app on shortcode ${shortcode} not found`)
        }
        const next_page: USSDPage = await pageObjectAdapter.findPage(ussd_app.id || '', 'intro')
        customer_session = { ...customer_session, current_page_name: next_page.name }
        sessionAdapter.storeSession(customer_session)
        return getRawPage(next_page, customer_session)
    } else {
        customer_session = await sessionAdapter.getSession(session_id) || null
        if (!customer_session) {
            throw Error(`session ${session_id} not found`)
        }
        const shortcode = customer_session.shortcode
        const current_page_name = customer_session.current_page_name || null
        const ussd_app: USSDApp | null = await USSDAppObjectAdapter.queryUSSDApp({ shortcode: shortcode })
        if (!ussd_app) {
            throw Error(`USSD app on shortcode ${shortcode} not found`)
        }
        if (!current_page_name) {
            throw Error(`user session ${session_id} has no valid page name`)
        }
        const current_page: USSDPage = await pageObjectAdapter.findPage(ussd_app.id || '', current_page_name)
        const customer_input_value = input.message

        customer_session.user_inputs = {
            ...customer_session.user_inputs,
            [current_page_name]: customer_input_value
        }

        const next_page: USSDPage | null = await getNextPage(input.message, ussd_app.id || '', current_page, pageObjectAdapter)
        if (!next_page) {
            throw Error(`failed to get next page. next page is null`)
        }

        customer_session = { ...customer_session, current_page_name: next_page.name }
        sessionAdapter.storeSession(customer_session)

        return getRawPage(next_page, customer_session)
    }
}

const getNextPage = async (
    input_message: string,
    ussd_app_id: string,
    current_page: USSDPage,
    pageObjectAdapter: PageObjectService,
): Promise<USSDPage | null> => {

    const next_page_name = current_page.next_page_name || null
    if (!next_page_name == null) {
        console.log(`next page name is null`)
        return null
    }
    console.log(`detected next page name: ${next_page_name}`)
    const page = await pageObjectAdapter.findPage(ussd_app_id, next_page_name)
    console.log(`detected next page id: ${page.name}`)
    console.log(`detected next page id: ${page.id}`)
    console.log(`detected next page id: ${page.context}`)
    return page
}

export const getRawPage = (
    page: USSDPage,
    customer_session: CustomerSession
): CustomerFeedbackPage => {

    return {
        content: page.context,
        type: page.type
    }
}

export const getDefaultErrorFeedback = async (USSDPageObjectsAdapter: PageObjectService, customer: Customer) => {
    return getRawPage(
        await USSDPageObjectsAdapter.getDefaultErrorPage(),
        {
            customer: customer,
            current_page_name: null,
            session_id: '',
            shortcode: '',
            user_inputs: {}
        }
    )
}