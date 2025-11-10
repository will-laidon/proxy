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
  M = 3000,
  A = 3001,
}

const PORT = Ports.M

const raw = String.raw`fetch("https://amman-mineral-qas-simplemdg-web.cfapps.ap11.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequestSteward", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"142\", \"Brave\";v=\"142\", \"Not_A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-correlation-id": "amman.qas@laidon.com",
    "x-csrf-token": "dab01b5db73e2952--7WTd4O4yIidNd8Le3R59gqu2ZQ",
    "cookie": "JSESSIONID=s%3ARNb6DplJQ6BEsOkS5zeeMj-jZfIXVs2Q.7yEAc1X17s5dk927HolzbPOyhi%2Bvi%2Bf4loSD2jjmyVk; __VCAP_ID__=bd1884d0-de57-4602-450f-dad2",
    "Referer": "https://amman-mineral-qas-simplemdg-web.cfapps.ap11.hana.ondemand.com/main/index.html"
  },
  "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"ALL\",\"objectType\":\"\",\"slaID\":\"\",\"isScheduled\":false,\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"sortBy\":[],\"createdBy\":[]}}",
  "method": "POST"
});`

const headers = extractHeadersFromAxiosCode(raw)
const SV_URL = new URL(headers.Referer).origin

app.use('/*', async (req: Request, res: Response) => {
  let request

  try {
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
  console.log(chalk.cyanBright.bold('SV_URL:'), chalk.underline.blueBright(SV_URL))
})
