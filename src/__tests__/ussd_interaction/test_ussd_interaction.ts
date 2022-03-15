import supertest from "supertest";
import { tedis } from "../../adapters/session_adapter";
import { app } from "../../app";
import xml2js from 'xml2js'
import { getDefaultErrorFeedback } from "../../application/interact_customer";
import { UserObjectAdapter } from "../../adapters/user_objects_adapter";
import { hashPassword } from "../../application/crud_user";
import { USSDAppObjectAdapter } from "../../adapters/ussd_app_objects_adapter";
import { USSDPageObjectsAdapter } from "../../adapters/ussd_page_objects_adapter";

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
        shortcode: "*435*106#",
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
        ussd_app_id: res.body.id,
        next_page_name: null
    }
    const res_create_page = await requestWithSuperTest
        .post('/api/ussd_pages/')
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
        // create the USSD AppxPages that will be used
        await createTestUser()
        const token = await login(test_user)

        await createTestUSSDPages(token)
    })

    afterAll(() => {
        tedis.close()
    })

    const msisdn = '233202009098'
    const sessionid = '00011'
    const shortcode = '*435*106#'

    it('USSD basic interaction', async () => {
        const xml_data: string =
            `<ussd>
            <msisdn>${msisdn}</msisdn>
            <sessionid>${sessionid}</sessionid>
            <type>1</type>
            <msg>${shortcode}</msg>
        </ussd>`

        const xml_data2: string =
            `<ussd>
            <msisdn>${msisdn}</msisdn>
            <sessionid>${sessionid}</sessionid>
            <type>2</type>
            <msg>1</msg>
        </ussd>`

        const res = await requestWithSuperTest
            .post('/menu_gen/pull/')
            .set('Content-Type', 'application/xml')
            .send(xml_data)
        console.log(res.text)
        xml2js.parseString(res.text, (err, result) => {
            console.log(result)
            expect(result.ussd.msisdn[0]).toEqual(msisdn)
            expect(result.ussd.sessionid[0]).toEqual(sessionid)
            expect(result.ussd.msg[0]).toEqual('')
        })
        expect(res.status).toEqual(200)

        const res2 = await requestWithSuperTest
            .post('/menu_gen/pull/')
            .set('Content-Type', 'application/xml')
            .send(xml_data2)
        console.log(res2.text)
        xml2js.parseString(res2.text, (err, result) => {
            console.log(result)
            expect(result.ussd.msisdn[0]).toEqual(msisdn)
            expect(result.ussd.sessionid[0]).toEqual(sessionid)
            expect(result.ussd.msg[0]).toEqual('how be')
        })
        expect(res2.status).toEqual(200)
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