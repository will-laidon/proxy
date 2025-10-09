import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'
import { extractHeadersFromAxiosCode } from './utils'

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

const PORT = Ports.ADMIN  

const raw = String.raw`fetch("https://morgan-foods-dev-simplemdg-web.cfapps.us20.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequestSteward", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Brave\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-correlation-id": "morganfoods.dev@laidon.com",
    "x-csrf-token": "9f20d7f19afadb94-121Qj_u79FInxHkLsOC0uX3-Qmw",
    "cookie": "JSESSIONID=s%3AuGJHnCxulbtHFQPQqxqym5K7K9So6VGC.64BKvb7xmhSab9N4PMvLJKQrS7DuhOFi5ANQ4GC2oFw; __VCAP_ID__=056f4a90-35fc-493c-5ed4-6150",
    "Referer": "https://morgan-foods-dev-simplemdg-web.cfapps.us20.hana.ondemand.com/main/index.html"
  },
  "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"REWORKED\",\"objectType\":\"\",\"slaID\":\"\",\"isScheduled\":false,\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"sortBy\":[],\"createdBy\":[]}}",
  "method": "POST"
});`


const headers = extractHeadersFromAxiosCode(raw)

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
