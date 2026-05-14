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

enum Ports {
  M = 3000,
  A = 3001,
}

const PORT = Number(process.env.PORT) || Ports.A
console.log('process.env.PORT: ', process.env.PORT)

let raw = String.raw`fetch("https://tysonfoods-qas-simplemdg-web.cfapps.us21.hana.ondemand.com/srv-admin/AdminService/CompanyLogos(2c67246f-498d-47cb-809c-03e4d1602be9)/image", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"148\", \"Microsoft Edge\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-correlation-id": "",
    "x-csrf-token": "9c09d9890014ad07-ajv_EhxlAoQRl3tTLd3Fa04Y2fU",
    "cookie": "__VCAP_ID__=26abdee3-3e45-4a14-6d09-4d2f; __VCAP_ID_META__=secure; JSESSIONID=s%3AEtiPYeUhuT1sTRFXI4ACqU2BgZs1M08f.L4e9H%2FJCJdofkAr%2BDgvttDL6mVuK2Hn6Aqf6Rlz0RUc",
    "Referer": "https://tysonfoods-qas-simplemdg-web.cfapps.us21.hana.ondemand.com/admin/index.html"
  },
  "body": "{}",
  "method": "PUT"
});`

if (PORT === Ports.M) {
  raw = String.raw`fetch("https://pre-stage-2-simplemdg-web.cfapps.br10.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequest", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"148\", \"Microsoft Edge\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-correlation-id": "single.ams@laidon.com",
    "x-csrf-token": "bf6840769a5a8fa8-On3cMXu_l1XAAA-oehrC06tgukY",
    "cookie": "notice_preferences=1:; notice_gdpr_prefs=0|1::implied|eu; cmapi_gtm_bl=ta-asp-bzi-sp-awct-cts-csm-img-flc-fls-mpm-mpr-m6d-tc-tdc; cmapi_cookie_privacy=permit_1|2_functional; optout_domains_pc=; __VCAP_ID_META__=secure; __VCAP_ID__=546daef8-d714-4522-53e7-71b3; JSESSIONID=s%3ADFxNmSJ0X045dq0NSI6axIAcjAD88ImD.lUQU6PyHXC8voENnJx4cl%2BtJzAxNbjYb2bWKaq57ZBc",
    "Referer": "https://pre-stage-2-simplemdg-web.cfapps.br10.hana.ondemand.com/main/index.html"
  },
  "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"ALL\",\"isScheduled\":false,\"objectType\":\"\",\"priority\":\"\",\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"createdBy\":[\"single.ams@laidon.com\"],\"sortBy\":[\"modifiedAt\",\"DESC\"]}}",
  "method": "POST"
});`
}

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
