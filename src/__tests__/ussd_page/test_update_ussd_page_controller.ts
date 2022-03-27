import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app, initializeApp, terminateApp } from '../../app'
import { hashPassword } from '../../application/crud_user'
import { cleanup_db } from '../utils'

const database_name = 'test_update_ussd_page'

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
        await initializeApp({ database_name: database_name })
        await createTestUser()
    })

    afterAll(async () => {
        await terminateApp()
        await cleanup_db(database_name)
    })

    it('Update a USSD Page. It requires a USSD page is already created', async () => {

        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*102#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_app)
        expect(res.status).toEqual(201)
        expect(res.body.shortcode).toEqual(test_create_ussd_app.shortcode)
        expect(res.body.id).not.toBe(null || undefined)

        const test_create_ussd_page: USSDPage = {
            context: 'hello',
            name: 'third_page',
            prev_page_name: 'intro',
            type: 'END',
            ussd_app_id: res.body.id,
            next_page_name: null
        }
        const res_create_page = await requestWithSuperTest
            .post('/api/ussd_pages/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_page)
        expect(res_create_page.status).toEqual(201)
        expect(res_create_page.body.id).not.toBe(null || undefined)
        expect(res_create_page.body.context).toEqual(test_create_ussd_page.context)

        const test_update_ussd_page: USSDPageUpdate = {
            context: 'hello from the other side!',
            name: 'not_third_page',
            type: 'CONTINUE',
        }
        const res_update_page = await requestWithSuperTest
            .put(`/api/ussd_pages/${res_create_page.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(test_update_ussd_page)
        expect(res_update_page.status).toEqual(200)
        expect(res_update_page.body.name).toEqual(test_update_ussd_page.name)
        expect(res_update_page.body.type).toEqual(test_update_ussd_page.type)
    })
})
