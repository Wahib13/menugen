import { app, initializeApp } from "./app";


initializeApp({})
    .then(
        () => {
            app.listen(process.env.PORT, () => console.log('listening'))
        }
    )
