import supertest from "supertest";
import { app, initializeApp, terminateApp } from "../../app";
import xml2js from 'xml2js'
import { UserObjectAdapter } from "../../adapters/user_objects_adapter";
import { hashPassword } from "../../application/crud_user";
import { cleanup_db } from "../utils";
import Mustache from "mustache";


const database_name = 'test_ussd_interaction'

const requestWithSuperTest = supertest(app)

type ViewUSSDRequest = {
    msisdn: string,
    sessionid: string,
    type: string,
    msg: string,
}

const test_user: User = {
    id: null,
    username: "testuser",
    email: "test@test.com",
    password: "awbaeir2438u",
}

const createTestUser = async (): Promise<User | null> => {

    return await UserObjectAdapter().createUser({
        id: null,
        username: test_user.username,
        password: await hashPassword(test_user.password || ''),
        email: test_user.email
    })
}

const createTestUSSDPages = async (token: string) => {
    const test_create_ussd_app: USSDApp = {
        shortcode: "*435*107#",
        name: "test_ussd_app",
    }
    const res = await requestWithSuperTest
        .post('/api/ussd_apps/')
        .set('Authorization', `Bearer ${token}`)
        .send(test_create_ussd_app)
    console.log(res.text)
    const test_create_ussd_page: USSDPage = {
        context: 'how be',
        name: 'second_page',
        prev_page_name: 'intro',
        type: 'END',
        options: [
            {
                content: 'not very well',
                next_page_name: 'sick_page'
            },
            {
                content: 'doing well',
                next_page_name: 'healthy page'
            }
        ],
        ussd_app_id: res.body.id,
        next_page_name: null
    }
    const test_create_ussd_page2: USSDPage = {
        context: 'sorry about that',
        name: 'sick_page',
        prev_page_name: 'sick_option',
        type: 'END',
        options: [],
        ussd_app_id: res.body.id,
        next_page_name: null
    }
    const test_create_ussd_page3: USSDPage = {
        context: 'congratulations on your good health',
        name: 'healthy_page',
        prev_page_name: 'healthy_option',
        type: 'END',
        options: [],
        ussd_app_id: res.body.id,
        next_page_name: null
    }
    await requestWithSuperTest
        .put(`/api/ussd_pages/${res.body.id}/intro`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            next_page_name: 'second_page'
        })
    await requestWithSuperTest
        .put(`/api/ussd_pages/${res.body.id}/second_page`)
        .set('Authorization', `Bearer ${token}`)
        .send(test_create_ussd_page)
    // check default page when app is created
    const res_get_all_pages = await requestWithSuperTest
        .get(`/api/ussd_pages/?app_id=${res.body.id}`)
        .set('Authorization', `Bearer ${token}`)
    expect(res_get_all_pages.status).toEqual(200)
    console.log(res_get_all_pages.body)
}

const login = async (user: User) => {

    const res_login = await requestWithSuperTest.post('/api/users/auth/')
        .send(
            {
                username: user.username,
                password: user.password
            }
        )

    const token = res_login.body.token
    return token
}

describe('USSD interaction', () => {

    beforeAll(async () => {
        await initializeApp({ database_name: database_name })
        // create the USSD AppxPages that will be used
        await createTestUser()
        const token = await login(test_user)

        await createTestUSSDPages(token)
    })

    afterAll(async () => {
        await terminateApp()
        await cleanup_db(database_name)
    })

    const msisdn = '233202009098'
    const sessionid = '00011'
    const shortcode = '*435*107#'

    it('USSD basic interaction', async () => {

        await ussd_interaction_test({
            msisdn: msisdn,
            sessionid: sessionid,
            msg: shortcode,
            type: '1'
        }, '', '2')()

        await ussd_interaction_test({
            msisdn: msisdn,
            sessionid: sessionid,
            msg: '1',
            type: '2'
        }, 'how be\n1. not very well\n2. doing well', '2')()

        // await ussd_interaction_test({
        //     msisdn: msisdn,
        //     sessionid: sessionid,
        //     msg: '2',
        //     type: '2'
        // }, 'congratulations on your good health', '3')()
    })

    it('USSD basic xml validation', async () => {
        const xml_data: string =
            `<ussd>
            <msisdn>${msisdn}</msisdn>
            <msg>${shortcode}</msg>
        </ussd>`

        const res = await requestWithSuperTest
            .post('/menu_gen/pull/')
            .set('Content-Type', 'application/xml')
            .send(xml_data)
        console.log(res.text)
        expect(res.status).toEqual(400)
    })
})

const ussd_interaction_test = (view: ViewUSSDRequest, expected_msg: string, expected_msg_type: string) => {
    return async () => {
        const xml_template =
            `<ussd>
            <msisdn>{{msisdn}}</msisdn>
            <sessionid>{{sessionid}}</sessionid>
            <type>{{type}}</type>
            <msg>{{msg}}</msg>
        </ussd>`
        const res = await requestWithSuperTest
            .post('/menu_gen/pull/')
            .set('Content-Type', 'application/xml')
            .send(Mustache.render(xml_template, view))
        xml2js.parseString(res.text, (err, result) => {
            console.log(res.text)
            console.log(result)
            expect(result.ussd.msisdn[0]).toEqual(view.msisdn)
            expect(result.ussd.sessionid[0]).toEqual(view.sessionid)
            expect(result.ussd.msg[0]).toEqual(expected_msg)
            expect(result.ussd.type[0]).toEqual(expected_msg_type)
        })
        expect(res.status).toEqual(200)
    }
}