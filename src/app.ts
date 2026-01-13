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
const raw = String.raw`fetch("https://multiple-erp-dev-simplemdg-web.cfapps.br10.hana.ondemand.com/srv-process/CommonProcessService/getBusinessRequest", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Microsoft Edge\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-correlation-id": "multiple.demo@laidon.com",
    "x-csrf-token": "ab6c506ea8d66270-rzf1s8lKBFlEhlSHjvCJ8bmKfpY",
    "cookie": "__VCAP_ID__=aac84547-5610-4dcb-7880-3601; JSESSIONID=s%3AJog8e0dlxSPi5AOoAo0iNOfCFQpxebRH.5lKwTeyk9CDD9XXC51%2F2OkgyFGNHfQ2RsCsOWmxAZqI",
    "Referer": "https://multiple-erp-dev-simplemdg-web.cfapps.br10.hana.ondemand.com/main/index.html"
  },
  "body": "{\"businessRequest\":{\"reqID\":\"\",\"tempID\":\"\",\"objectID\":\"\",\"createdAtFrom\":\"\",\"createdAtTo\":\"\",\"modifiedAtFrom\":\"\",\"modifiedAtTo\":\"\",\"reason\":\"\",\"status\":\"ALL\",\"objectType\":\"\",\"slaID\":\"\",\"isType\":\"STATUS\",\"top\":20,\"skip\":0,\"offSet\":0,\"searchString\":\"\",\"createdBy\":[\"multiple.demo@laidon.com\"],\"sortBy\":[\"modifiedAt\",\"DESC\"]}}",
  "method": "POST"
});`

const headers = extractHeadersFromAxiosCode(raw)
const SV_URL = new URL(headers.Referer).origin
// ===============================================================================
// const CUSTOM_BASE = 'https://pre-stage-2-simplemdg-srv-custom.cfapps.br10.hana.ondemand.com'
// const BEARER =
//   'eyJ0eXAiOiJKV1QiLCJqaWQiOiJPNXZaeEIyajhNVmVaM1JmZ3VkNHpsaHVZZzFrcUVVWGl6di83eG9zSzJBPSIsImFsZyI6IlJTMjU2Iiwiamt1IjoiaHR0cHM6Ly9zaW5nbGUtYW1zLXNpbXBsZW1kZy5hdXRoZW50aWNhdGlvbi5icjEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktMzMwMDNiOGJjZSJ9.eyJzdWIiOiJzYi1zaW1wbGVtZGchdDE3NTEzIiwiaXNzIjoiaHR0cHM6Ly9zaW5nbGUtYW1zLXNpbXBsZW1kZy5hdXRoZW50aWNhdGlvbi5icjEwLmhhbmEub25kZW1hbmQuY29tL29hdXRoL3Rva2VuIiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sImNsaWVudF9pZCI6InNiLXNpbXBsZW1kZyF0MTc1MTMiLCJhdWQiOlsidWFhIiwic2Itc2ltcGxlbWRnIXQxNzUxMyJdLCJleHRfYXR0ciI6eyJlbmhhbmNlciI6IlhTVUFBIiwic3ViYWNjb3VudGlkIjoiNDJmYTQ2MzUtMjhmNS00ZjViLWFmNTctYjk1OTY4NDFiMDRhIiwiemRuIjoic2luZ2xlLWFtcy1zaW1wbGVtZGcifSwiemlkIjoiNDJmYTQ2MzUtMjhmNS00ZjViLWFmNTctYjk1OTY4NDFiMDRhIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsImF6cCI6InNiLXNpbXBsZW1kZyF0MTc1MTMiLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiZXhwIjoxNzY3OTM1MTA5LCJpYXQiOjE3Njc5MzE1MDksImp0aSI6ImU0M2Q4MzI5NmNlZjQxZGNiNmQ1ZDFjM2UyMGYxNmM1IiwicmV2X3NpZyI6IjhhYzVhNGVlIiwiY2lkIjoic2Itc2ltcGxlbWRnIXQxNzUxMyJ9.hTezJoxwqtVRk1cvCjGAqrK_5DJCpQOkatkEaVWXBEhQO5kRJisfOJCAEjODof2QNvevnfqLyuQmQaqacAHWr3NhTM8_M1W90NP6LwfG_f1nDnuFpSquuiiHvjfSQfNq05Q88tyw46eYWy26CbR2vOt7u1bkJXhc1dJKTavt_cVmg5R7v3N04kzYdMg5Lqikz_CW8u9LVKvCzsamiaeWEBOAFz0mOwLgWQvb5ISqyp84DYny43tGt8n2i0G8t0oDvGPt_Cn-ERS2qPeIysQxFgW2-smnqZfkTk24CTYLevmeH9_Ab1mfH5OxsVZD1iKehG6mn3vzhqDGpyGm7jXzVw'

// app.use('/srv-custom', async (req: Request, res: Response) => {
//   const upstreamUrl = `${CUSTOM_BASE}${req.originalUrl.replace(/^\/srv-custom/, '')}`
//   console.log('upstreamUrl: ', upstreamUrl)

//   try {
//     const proxied = await axios.request({
//       method: req.method as any,
//       url: upstreamUrl,
//       data: req.body,
//       headers: {
//         ..._.omit(req.headers, ['host', 'origin', 'referer', 'cookie', 'content-length', 'connection']),
//         ...(BEARER ? { Authorization: `Bearer ${BEARER}` } : {}),
//       },
//       validateStatus: () => true,
//     })

//     const safeHeaders = _.omit(proxied.headers, ['transfer-encoding', 'connection', 'content-length'])
//     res.set(safeHeaders)
//     res.status(proxied.status || 200).send(proxied.data)
//   } catch (error: any) {
//     const status = error?.response?.status || 500
//     const message = error?.response?.data || error?.message || 'Internal Server Error'
//     return res.status(status).send(message)
//   }
// })
// ===============================================================================

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
