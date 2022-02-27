type USSDApp = {
    id?: string,
    name?: string,
    shortcode: string
}

type USSDPage = {
    id?: string,
    ussd_app: USSDApp,
    name: string,
    context: string,
    prev_page_name?: string,
    next_page_name?: string,
    type: 'END' | 'CONTINUE'
}
