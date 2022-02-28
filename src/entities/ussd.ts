type USSDApp = {
    id: string | null,
    name?: string,
    shortcode: string,
}

type USSDPage = {
    id: string | null,
    ussd_app_id: string | null,
    name: string,
    context: string,
    prev_page_name?: string,
    next_page_name?: string,
    type: 'END' | 'CONTINUE'
}
