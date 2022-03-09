import { UserObjectService } from "../application/ports";

var users: User[] = [
    
]

var max_id: number = 0;

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
            const new_user = { ...user, id: new_id }
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
