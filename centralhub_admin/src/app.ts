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
        'accept-language': 'en-GB',
        'application-interface-key': '52ve7fwy',
        priority: 'u=1, i',
        referer: 'https://smdg-s4-dev-simplemdg-web.cfapps.br10.hana.ondemand.com/admin/index.html',
        'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'x-correlation-id': 'smdg.dev@simplemdg.com',
        'x-csrf-token': '0d86ed8466fbc291-7KDipCkGENUnFqfxfGRa6i8Fhf4',
        Cookie: 'notice_gdpr_prefs=0::implied,eu; cmapi_cookie_privacy=permit 1 required; cmapi_gtm_bl=ga-ms-ua-ta-asp-bzi-sp-awct-cts-csm-img-flc-fls-mpm-mpr-m6d-tc-tdc; notice_preferences=0:; notice_behavior=implied,eu; __VCAP_ID__=6a7c9c00-2100-466d-465a-a30f; JSESSIONID=s%3AkiBeDNr5vT_1dIHLwO69e-SAW8d83HWq.iq5CA7y2XBxxG4C8OHsuXEGgNFzu59xf8c2SQ3cZSXc',
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
