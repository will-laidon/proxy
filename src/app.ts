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

// app.use('/srv-main/MainService/RequestAttachments', async (req: Request, res: Response) => {
//   // set OData-Version 4.0
//   res.setHeader('OData-Version', '4.0')
//   return res.status(200).send({
//   "@odata.context": "$metadata#RequestAttachments",
//   "value": [
//     {
//       "ID": "e5b9c861-2c3e-4dfa-80d7-f1340b3415ee",
//       "createdAt": "2026-02-12T04:04:49.634Z",
//       "createdBy": "admin.s4cloud@laidon.com",
//       "endTime": "2000-01-01T00:00:00.000Z",
//       "file@odata.mediaContentType": null,
//       "fileID": "SIMPLEMDG_PublicCloud/MasterData/CR0000011352/20260212/1006632_ARTM.01_2026-02-04T10_38_20.568Z.xlsx",
//       "fileName": "1006632_ARTM.01_2026-02-04T10_38_20.568Z.xlsx",
//       "fileSize": "55012",
//       "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "isActive": true,
//       "isDraft": false,
//       "isMarkDelete": false,
//       "itemID": null,
//       "modifiedAt": "2026-02-12T04:10:11.376Z",
//       "modifiedBy": "privileged",
//       "reqID": "CR0000011352",
//       "storageType": "6",
//       "type": "RequestAttachment",
//       "url": "https://laidonnam.sharepoint.com/sites/SitepointUpload"
//     },
//     {
//       "ID": "b80f6fae-f0c7-4244-9f20-81800d8aa0d2",
//       "createdAt": "2026-02-12T04:04:48.967Z",
//       "createdBy": "admin.s4cloud@laidon.com",
//       "endTime": "2000-01-01T00:00:00.000Z",
//       "file@odata.mediaContentType": null,
//       "fileID": "SIMPLEMDG_PublicCloud/MasterData/CR0000011352/20260212/2662501_SA_BP02_2026-01-29T04_06_31.859Z.xlsx",
//       "fileName": "2662501_SA_BP02_2026-01-29T04_06_31.859Z.xlsx",
//       "fileSize": "30532",
//       "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "isActive": true,
//       "isDraft": false,
//       "isMarkDelete": false,
//       "itemID": null,
//       "modifiedAt": "2026-02-12T04:10:11.376Z",
//       "modifiedBy": "privileged",
//       "reqID": "CR0000011352",
//       "storageType": "6",
//       "type": "RequestAttachment",
//       "url": "https://laidonnam.sharepoint.com/sites/SitepointUpload"
//     },
//     {
//       "ID": "f7f807fb-9b7d-42cb-a955-18bc36b193cc",
//       "createdAt": "2026-02-12T04:04:47.523Z",
//       "createdBy": "admin.s4cloud@laidon.com",
//       "endTime": "2000-01-01T00:00:00.000Z",
//       "file@odata.mediaContentType": null,
//       "fileID": "SIMPLEMDG_PublicCloud/MasterData/CR0000011352/20260212/2223919_UIMDCLASSTYPE_2026-02-11T11_50_17.195Z_2026-02-11T11_50_17.195Z.xlsx",
//       "fileName": "2223919_UIMDCLASSTYPE_2026-02-11T11_50_17.195Z_2026-02-11T11_50_17.195Z.xlsx",
//       "fileSize": "19564",
//       "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "isActive": true,
//       "isDraft": false,
//       "isMarkDelete": false,
//       "itemID": null,
//       "modifiedAt": "2026-02-12T04:10:11.376Z",
//       "modifiedBy": "privileged",
//       "reqID": "CR0000011352",
//       "storageType": "6",
//       "type": "RequestAttachment",
//       "url": "https://laidonnam.sharepoint.com/sites/SitepointUpload"
//     }
//   ]
// })
// })

const PORT = Number(process.env.PORT) || Ports.A
console.log('process.env.PORT: ', process.env.PORT)
// .filter(e => e.tableName.length > 25).map(e => e.tableName)
let raw = String.raw`fetch("https://multiple-erp-dev-simplemdg-web.cfapps.br10.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequest", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"146\", \"Not-A.Brand\";v=\"24\", \"Microsoft Edge\";v=\"146\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-correlation-id": "multiple.demo@laidon.com",
    "x-csrf-token": "520d3c3e5959f9c3-ZRkh36TZPxks5Nke2FXNC2F8QFk",
    "cookie": "__VCAP_ID__=6649d15b-f948-46a6-4aa7-43a4; JSESSIONID=s%3ALorpjfBSBkZmdAlmSiRpRO7w-lmTRy3S.Z2QNLknrNMTB5a5KAlP4ANHJ%2FejXwTVcAYkjZ3PENEk",
    "Referer": "https://multiple-erp-dev-simplemdg-web.cfapps.br10.hana.ondemand.com/main/index.html"
  },
  "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"ALL\",\"objectType\":\"\",\"slaID\":\"\",\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"createdBy\":[\"multiple.demo@laidon.com\"],\"sortBy\":[\"modifiedAt\",\"DESC\"]}}",
  "method": "POST"
});`

if (PORT === Ports.M) {
  raw = String.raw`fetch("https://ait-dev-simplemdg-web.cfapps.us21.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequest", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"146\", \"Not-A.Brand\";v=\"24\", \"Microsoft Edge\";v=\"146\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-correlation-id": "ait.dev@laidon.com",
    "x-csrf-token": "5f6a59d5d85bfdfe-49waFJxCzhVzGf6lGrkw2EK3b1A",
    "cookie": "JSESSIONID=s%3AQe7T6k9UDw2Psp6Q5lJsGdL4xh8fhjaX.uXvBFXlsKW4CGfGcVCPpmFvV2RFJ3fn00f%2F0ZgEA78w; __VCAP_ID__=3c421b6e-6d49-43f6-4b40-123d",
    "Referer": "https://ait-dev-simplemdg-web.cfapps.us21.hana.ondemand.com/main/index.html"
  },
  "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"ALL\",\"isScheduled\":false,\"objectType\":\"\",\"slaID\":\"\",\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"createdBy\":[\"ait.dev@laidon.com\"],\"sortBy\":[\"modifiedAt\",\"DESC\"]}}",
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
