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
let raw = String.raw`fetch("https://olymel-dev-simplemdg-web.cfapps.ca10.hana.ondemand.com/srv-approver/ApproverService/myInbox", {
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
    "x-correlation-id": "olymel.dev@laidon.com",
    "x-csrf-token": "b94264e3946ac43d-gA8wWBc_uamoZOHSayXEhkilT74",
    "cookie": "JSESSIONID=s%3AEt_UJnw7VI4_s5iptDyhLOcmMlkp4CjK.TY%2BRkh0bofkVMnVOSWDEQxRpVIYnMJak4qVQWxNxEnY; __VCAP_ID__=aac3f821-e406-40d9-7997-a773",
    "Referer": "https://olymel-dev-simplemdg-web.cfapps.ca10.hana.ondemand.com/main/index.html"
  },
  "body": "{\"myInbox\":{\"category\":\"DIRECT\",\"status\":\"\",\"searchString\":\"\",\"top\":20,\"skip\":0,\"offSet\":0,\"isScheduled\":false,\"sortBy\":[\"\",\"DESC\"],\"groupBy\":\"approvalStatus\"}}",
  "method": "POST"
});`


// if (PORT === Ports.A) {
//   raw = String.raw`fetch("https://pre-stage-2-simplemdg-web.cfapps.br10.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequest", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US",
//     "application-interface-key": "52ve7fwy",
//     "cache-control": "no-cache",
//     "content-type": "application/json",
//     "pragma": "no-cache",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Microsoft Edge\";v=\"145\", \"Chromium\";v=\"145\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "x-correlation-id": "rina.ksor@laidon.com",
//     "x-csrf-token": "442b135d22a8c629-VFdgSN3p106-QXJ-CDqsQ1dP82A",
//     "cookie": "JSESSIONID=s%3AANDbWbrpQXYYAQM2D002OYWCAdHsvxbZ.Z8hry5Csqvi6IqwN6tIgswFa%2Beecmdy%2BbkD1CZvtA9o; __VCAP_ID__=3c665d87-73ce-48a7-737c-d74b",
//     "Referer": "https://pre-stage-2-simplemdg-web.cfapps.br10.hana.ondemand.com/main/index.html"
//   },
//   "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"ALL\",\"isScheduled\":false,\"objectType\":\"\",\"priority\":\"\",\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"createdBy\":[\"rina.ksor@laidon.com\"],\"sortBy\":[\"modifiedAt\",\"DESC\"]}}",
//   "method": "POST"
// });`
// }


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
