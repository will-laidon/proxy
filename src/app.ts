import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'

config.config()

const app: Application = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/srv-requestoor/RequestorService/getMigrationLogs', (req: Request, res: Response) => {
  return res.json()
})

enum Ports {
  MAIN = 3000,
  ADMIN = 3001,
}

const PORT = Ports.MAIN

const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
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
    "x-correlation-id": "amber.nguyen@laidon.com",
    "x-csrf-token": "0ea664221e5ab50d-Tfh1etb0-l7FPPkqdByeH1R9_Jk",
    "cookie": "__VCAP_ID__=65b099ba-8f42-497a-671c-df89; JSESSIONID=s%3A2QN5qe8l74Zd_4cDadf1-Cu5MxBlOXuW.Tg4X%2FN1TcmqHkHTgo53%2BnI6iQRxUWoUuG4Pr6B1cgWY",
    "Referer": "https://edf-qep-simplemdg-web.cfapps.us21.hana.ondemand.com/main/index.html"
  }

app.use('/*', async (req: Request, res: Response) => {
  let request

  try {
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

  const safeHeaders = _.omit(request.headers, ['transfer-encoding', 'connection', 'content-length'])
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
