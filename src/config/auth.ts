import { TOKEN_SECRET_KEY } from '../environments/tokenSecretKey'

export default {
  jwt: {
    secret: TOKEN_SECRET_KEY,
    expiresIn: '7d'
  }
}
