import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'

config.config()

const app: Application = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// app.use('/srv-requestor/RequestorService/getMigrationLogs', (req: Request, res: Response) => {
//   return res.json()
// })

const PORT = 3000

app.use('/*', async (req: Request, res: Response) => {
  let request

  try {
    const headers ={
    "accept": "application/json, text/plain, */*",
    "accept-language": "en",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Brave\";v=\"140\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-correlation-id": "leo.phan@laidon.com",
    "x-csrf-token": "48433e9cb967eacc-UlDhtA1P0ZMR4UalB4X2AN_hZyc",
    "cookie": "JSESSIONID=s%3A5CYpnqi4903yiSeQhv5cD3yE9sb2m_i7.aX0Uo5ogdtXwMroUG5UYScE7O%2FCzlMx6Z1bLyNTqtiM; __VCAP_ID__=434a2d14-68f7-4e0f-40eb-ee44",
    "Referer": "https://edf-dev-simplemdg-web.cfapps.us10-001.hana.ondemand.com/main/index.html"
  }

    const SV_URL = new URL(headers.Referer).origin

    console.log(chalk.magenta('[Proxy]', chalk.cyan(`${SV_URL}${req.originalUrl}`)))
    request = await axios.request({
      method: req.method,
      url: `${SV_URL}${req.originalUrl}`,
      data: req.body,
      headers,
    })
  } catch (error) {
    const status = error?.response?.status || 500
    const message = error?.response?.data || error?.message || 'Internal Server Error'
    console.error(chalk.red('[Proxy Error]'), chalk.yellow(status.toString()), message)
    return res.status(status).send(message)
  }

  const headers = request.headers
  const safeHeaders = _.omit(headers, ['transfer-encoding', 'connection', 'content-length'])
  res.set(safeHeaders)

  let data = request.data
  if (_.isNumber(data)) {
    data = data.toString()
  }

  return res.status(request.status ?? 200).send(data)
})

app.listen(PORT, (): void => {
  console.log(chalk.green('SERVER IS UP ON PORT:'), chalk.yellow(PORT))
})
