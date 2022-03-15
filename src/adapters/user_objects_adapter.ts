import { UserObjectService } from "../application/ports";
import fs from 'fs'
import path from 'path'

var users: User[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../../fake_data/users.json'), 'utf-8'))

const writeToFile = async () => {
    await fs.writeFile('fake_data/users.json', JSON.stringify(users), () => { })
}

try {
    var max_id: number = Number(users.reduce((prev, current) => {
        return (Number(prev.id) > Number(current.id)) ? prev : current
    }).id || 0);
} catch (error) {
    var max_id: number = 0
}


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
            await writeToFile()
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
