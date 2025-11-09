import { config } from "dotenv"
config()

//NOTE: If you are running the project in an instance, you should store these secret keys in its configuration settings.
// This type of storing secret information is only experimental and for the purpose of local running.

const { DATABASE_URL, PORT, JWT_SECRET_KEY, OPENAI_API_KEY } = process.env
export { DATABASE_URL, PORT, JWT_SECRET_KEY, OPENAI_API_KEY }
