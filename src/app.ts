import express, { Application, NextFunction, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'
import { extractHeadersFromAxiosCode } from './utils'

config.config()

const app: Application = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// app.use('/srv-main/MainService/ServiceLevelAgreements', (req: Request, res: Response) => {
//   return res.json()
// })

// app.use('/srv-approver/ApproverService/myInboxMass', (req: Request, res: Response) => {
//   return res.json()
// })

enum Ports {
  M = 3000,
  A = 3001,
}

const PORT = Number(process.env.PORT) || Ports.A
console.log('process.env.PORT: ', process.env.PORT)


const raw = String.raw`fetch("https://pre-stage-2-simplemdg-web.cfapps.br10.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequest", {
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
    "x-correlation-id": "single.ams@laidon.com",
    "x-csrf-token": "172a530cff97e057-TM8UuFmHV9oyrroW730IiXhJBa0",
    "cookie": "JSESSIONID=s%3AHSZPcGmUagB0jkvaxV5lC81lYOHO9BD3.Px%2FjjJm508wm9wbMr%2BMSLCSj5HY1v6fwahfk68CsetE; __VCAP_ID__=7de7ad24-3bd2-40e3-64b5-e527",
    "Referer": "https://pre-stage-2-simplemdg-web.cfapps.br10.hana.ondemand.com/main/index.html"
  },
  "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"ALL\",\"isScheduled\":false,\"objectType\":\"\",\"priority\":\"\",\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"createdBy\":[\"single.ams@laidon.com\"],\"sortBy\":[\"modifiedAt\",\"DESC\"]}}",
  "method": "POST"
});`

const headers = extractHeadersFromAxiosCode(raw)
const SV_URL = new URL(headers.Referer).origin

app.use(async (req: Request, res: Response, next: NextFunction) => {
  const path = req.path.toLowerCase()

  const isImage = path.endsWith('/image') || path.includes('/image(') || path.match(/\.(png|jpe?g|gif|webp)$/)

  if (!isImage) {
    return next()
  }

  try {
    console.log(chalk.magenta('[Proxy Image]'), chalk.cyan(`${SV_URL}${req.originalUrl}`))

    const proxied = await axios.request({
      method: req.method,
      url: `${SV_URL}${req.originalUrl}`,
      data: req.body,
      headers,
      responseType: 'stream',
      validateStatus: () => true,
    })

    const safeHeaders = _.omit(proxied.headers, ['transfer-encoding', 'connection', 'content-length'])
    res.set(safeHeaders)
    res.status(proxied.status || 200)
    ;(proxied.data as NodeJS.ReadableStream).pipe(res)
  } catch (error: any) {
    const status = error?.response?.status || 500
    const message = error?.response?.data || error?.message || 'Internal Server Error'

    console.error(chalk.red('[Proxy Error Image]'), chalk.yellow(status.toString()), message)

    return res.status(status).send(message)
  }
})

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
