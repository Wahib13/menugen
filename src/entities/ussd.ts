type USSDApp = {
    id?: string,
    name?: string,
    shortcode: string,
}

type USSDPage = {
    id?: string,
    ussd_app_id: string | null,
    name: string,
    context: string,
    level?: number,
    prev_page_name: string | null,
    next_page_name: string | null,
    type: 'END' | 'CONTINUE'
}

type CustomerFeedbackPage = {
    content: string,
    type: 'END' | 'CONTINUE'
}

type USSDPageUpdate = {
    name?: string,
    context?: string,
    type?: 'END' | 'CONTINUE'
}