type Customer = {
    msisdn: string
}

type CustomerSession = {
    customer: Customer,
    shortcode: string,
    session_id: string,
    current_page_name: string | null,
    user_inputs?: {}
}

type CustomerInput = {
    message: string,
    type: 'INITIATE' | 'CONTINUE'
}