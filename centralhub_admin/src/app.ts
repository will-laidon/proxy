import express, { Application, Request, Response } from 'express'

import axios from 'axios'

const app: Application = express()

import config from 'dotenv'

import * as _ from 'lodash'

config.config()

const PORT = Number(process.env.PORT ?? 3000)

const SERV_URL = `${process.env.SERV_URL ?? ''}`

app.use(express.json())

app.use('/*', async (req: Request, res: Response) => {
  let request

  try {
    // const clientToken  = await getClientToken();

    console.log(`${SERV_URL}${req.originalUrl}`)

    request = await axios.request({
      method: req.method,
      url: `${SERV_URL}${req.originalUrl}`,
      data: req?.body,
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US',
        'application-interface-key': '52ve7fwy',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'x-correlation-id': 'single.ams@laidon.com',
        'x-csrf-token': 'e91939bdd16a6283-xBMNmSLH37LVGEa8lqY0rpiINu8',
        cookie: '__VCAP_ID__=47dd19ff-fdb8-43a7-4b0b-8574; JSESSIONID=s%3AjiY4rmXn09chSTOTpZvvYNRRsSpa7_tt.obtuNtY%2Fk5n873T2rz%2F0Dz0ze4SnH3WKDcOUOXftHLo',
        Referer: 'https://single-ams-simplemdg-web.cfapps.br10.hana.ondemand.com/main/index.html',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
  } catch (error) {
    const status = error?.response?.status || 500
    const message = error?.response?.data || error?.message || 'Internal Server Error'
    console.error('[Proxy Error]', status, message)
    return res.status(status).send(message)
  }

  const headers = request.headers

  _.unset(headers, 'transfer-encoding')

  const safeHeaders = _.omit(headers, ['transfer-encoding', 'connection', 'content-length'])
  res.set(safeHeaders)

  let data = request?.data

  if (_.isNumber(data)) {
    data = data.toString()
  }

  return res.status(request?.status ?? 200).send(data)
})

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT)
})
