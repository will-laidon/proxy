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
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US',
        'application-interface-key': '52ve7fwy',
        'content-type': 'application/json',
        origin: 'https://cytiva-dev-simplemdg-web.cfapps.us10-001.hana.ondemand.com',
        priority: 'u=1, i',
        referer: 'https://cytiva-dev-simplemdg-web.cfapps.us10-001.hana.ondemand.com/main/index.html',
        'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'x-correlation-id': 'cytiva.dev@laidon.com',
        'x-csrf-token': '7cd04bb8a29935a2-bVrT4PLNALVeTqfl6P0uFBrH5Mg',
        cookie: 'JSESSIONID=s%3A9UxBlp8u1JKkSdWxZfpzZ4WjNTXnvYOZ.NoalwkAzEYnpSnSgCPe91zTi1%2BQo1c2PxgCH1nn0I%2Bo; __VCAP_ID__=72c9dfa2-b33c-48d4-76e5-3c88',
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
