import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app } from '../../app'
import { hashPassword } from '../../application/crud_user'

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
        password: hashPassword(test_user.password || ''),
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

describe('User endpoints', () => {

    beforeAll(async () => {
        await createTestUser()
    })

    afterAll(async () => {
        // delete all users
    })

    it('Create a USSD App. it should succeed and a blank USSD page should be created', async () => {

        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            id: null,
            shortcode: "*435*100#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(
                test_create_ussd_app
            )
        expect(res.status).toEqual(201)
        expect(res.body.shortcode).toEqual("*435*100#")
        expect(res.body.id).not.toBe(null || undefined)

        // test get it back and verify it is what was created
        const res_get = await requestWithSuperTest
            .get(`/api/ussd_apps/${res.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get.status).toEqual(200)
        expect(res_get.body.shortcode).toEqual("*435*100#")
        expect(res_get.body.id).toEqual(res.body.id)
    })
})
