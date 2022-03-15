import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app } from '../../app'
import { hashPassword } from '../../application/crud_user'
import http_status_codes from 'http-status-codes'

const requestWithSuperTest = supertest(app)


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

describe('USSD Page Endpoints', () => {

    beforeAll(async () => {
        await createTestUser()
    })

    afterAll(async () => {
        // delete all users
    })

    it('Create a USSD Page. It requires a USSD app is already created', async () => {

        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*100#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_app)
        expect(res.status).toEqual(201)
        expect(res.body.shortcode).toEqual("*435*100#")
        expect(res.body.id).not.toBe(null || undefined)

        // check default page when app is created
        const res_get_all_pages = await requestWithSuperTest
            .get(`/api/ussd_pages/?app_id=${res.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_all_pages.status).toEqual(200)
        console.log(res_get_all_pages.body)
        expect(res_get_all_pages.body.length).not.toBe(0)
        expect(res_get_all_pages.body[0].id).not.toBe(null || undefined)

        const test_create_ussd_page: USSDPage = {
            context: 'hello',
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
        // console.log(res_create_page.body)
        expect(res_create_page.status).toEqual(201)
        expect(res_create_page.body.id).not.toBe(null || undefined)
        expect(res_create_page.body.context).toEqual(test_create_ussd_page.context)

        const res_get_page = await requestWithSuperTest
            .get(`/api/ussd_pages/${res_create_page.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_page.status).toEqual(200)
        expect(res_get_page.body.name).toEqual(test_create_ussd_page.name)
        expect(res_get_page.body.level).toEqual(res_get_all_pages.body[0].level + 1)

        // second page should make previous page type 'CONTINUE' and increase page level
        const test_create_ussd_page2: USSDPage = {
            context: 'hello from the other side',
            name: 'third_page',
            prev_page_name: 'second_page',
            type: 'END',
            ussd_app_id: res.body.id,
            next_page_name: null
        }
        const res_create_page2 = await requestWithSuperTest
            .post('/api/ussd_pages/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_page2)

        const res_get_page2 = await requestWithSuperTest
            .get(`/api/ussd_pages/${res_create_page2.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_page2.status).toEqual(200)
        expect(res_get_page2.body.name).toEqual(test_create_ussd_page2.name)
        expect(res_get_page2.body.level).toEqual(res_get_page.body.level + 1)

        const res_get_page1 = await requestWithSuperTest
            .get(`/api/ussd_pages/${res_create_page.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_page1.status).toEqual(200)
        expect(res_get_page1.body.type).toEqual('CONTINUE')


    })

    it('test create page validation', () => {

    })
})
