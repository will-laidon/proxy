import express, { Application, Request, Response } from 'express'

import axios from 'axios'

const app: Application = express()

import config from 'dotenv'

import * as _ from 'lodash'

config.config()

const PORT = Number(process.env.PORT ?? 3000)

const SERV_URL = `${process.env.SERV_URL ?? ''}`

// app.use(express.json());
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb' }))

app.use('/*', async (req: Request, res: Response) => {
  let request

  try {
    // const clientToken  = await getClientToken();

    console.log(`${SERV_URL}${req.originalUrl}`)

    request = await axios.request({
      method: req.method,
      url: `${SERV_URL}${req.originalUrl}`,
      data: req?.body,
     "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US",
    "application-interface-key": "52ve7fwy",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Brave\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "cookie": "__VCAP_ID__=ed7cf2a1-fb2b-4e02-77d7-8d61; JSESSIONID=s%3AOIjtpxk5M0kdZLL5Y58bVaJMiGmcEMOi.TeQVZBm7KFbxSp18GCnZScQVR76eDfq7WGu3bxcwCpY",
    "Referer": "https://single-ams-simplemdg-web.cfapps.br10.hana.ondemand.com/admin/index.html",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
    })
  } catch (error) {
    return res.status(400).send(error?.message)
  }

  const headers = request.headers

  _.unset(headers, 'transfer-encoding')

  res.set(headers)

  let data = request?.data

  if (_.isNumber(data)) {
    data = data.toString()
  }

  // res.sendStatus(request?.status ?? 200);

  return res.status(request?.status ?? 200).send(data)
})

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT)
})
