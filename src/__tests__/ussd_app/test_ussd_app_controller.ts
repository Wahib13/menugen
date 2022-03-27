import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app, initializeApp, terminateApp } from '../../app'
import { hashPassword } from '../../application/crud_user'
import dotenv from 'dotenv'
import { cleanup_db } from '../utils'

dotenv.config()

const database_name = 'test_ussd_app_validator'

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

describe('USSD app endpoints', () => {

    beforeAll(async () => {
        await initializeApp({ database_name: database_name })
        await createTestUser()
    })

    afterAll(async () => {
        await terminateApp()
        await cleanup_db(database_name)
    })

    it('Create a USSD App. it should succeed and a blank USSD page should be created', async () => {

        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*109#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(
                test_create_ussd_app
            )
        expect(res.status).toEqual(201)
        expect(res.body.shortcode).toEqual("*435*109#")
        expect(res.body.id).not.toBe(null || undefined)

        // test get it back and verify it is what was created
        const res_get = await requestWithSuperTest
            .get(`/api/ussd_apps/${res.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get.status).toEqual(200)
        expect(res_get.body.shortcode).toEqual("*435*109#")
        expect(res_get.body.id).toEqual(res.body.id)

        const res_get_all = await requestWithSuperTest
            .get('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_all.status).toEqual(200)
        expect(res_get_all.body.length).toBeGreaterThan(0)
        expect(res_get_all.body[0].id).toEqual(res.body.id)

    })
})
