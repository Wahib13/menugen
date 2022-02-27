import { app } from './app'

// if (process.env.NODE_ENV !== 'test') {
//     app.listen(process.env.PORT, () => console.log('listening'))
// }

app.listen(process.env.PORT, () => console.log('listening'))
