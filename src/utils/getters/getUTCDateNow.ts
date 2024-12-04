import axios from 'axios'

const baseUrl = new URL('https://worldtimeapi.org/api/timezone/Etc/UTC')

export const GetUTCDateNow = async () => {
  return await axios
    .get(baseUrl.toString(), { timeout: 2000 })
    .then(response => new Date(response.data.datetime))
    .catch(() => new Date())
}
