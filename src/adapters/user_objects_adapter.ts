import { UserObjectService } from "../application/ports";

var users: User[] = [
    {
        id: '1',
        username: 'wahib',
        password: 'secret_1',
        email: 'wahibfarhat13@gmail.com'
    }
]

var max_id: number = 1;

export const UserObjectAdapter = (): UserObjectService => {
    return {
        async getUser(id: string) {
            return users.find((user) => user.id === id) || null
        },
        async getUsers() {
            return users
        },
        async createUser(user: User) {
            max_id++
            const new_id = String(max_id)
            const new_user = { id: new_id, ...user }
            users = [...users, new_user]
            return new_user
        },
        async findUser(query: any) {
            return users.find((user) => user.username === query.username) || null
        },
        async deleteUser(id: string) {
            users = users.filter((user) => user.id !== id)
            return true
        }
    }
}
