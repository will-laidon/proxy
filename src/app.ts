import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'
import { PORT, SERV_URL } from './config'

config.config()

const app: Application = express()

app.use(express.json())

app.use('/*', async (req: Request, res: Response) => {
  let request

  try {
    console.log(chalk.magenta('[Proxy]', chalk.cyan(`${SERV_URL}${req.originalUrl}`)))

    request = await axios.request({
      method: req.method,
      url: `${SERV_URL}${req.originalUrl}`,
      data: req.body,
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US',
        'application-interface-key': '52ve7fwy',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'x-correlation-id': 'teri.vo@laidon.com',
        'x-csrf-token': '35d557e0cd477c5f-j2X0qxCGzgu2qgrrcumwsOSsz_c',
        cookie: '__VCAP_ID__=35b491a8-d8b5-4b6d-4ec9-e1fb; JSESSIONID=s%3A22HjgR-lPfTpoEbpFLiqR311PIfRo7j2.ugBsqjeqVTAxd%2Frbn16BJQMeCueAc2pTcz963AP1BUo',
        Referer: 'https://metrie-dev-simplemdg-web.cfapps.us10-001.hana.ondemand.com/main/index.html',
      },
    })
  } catch (error) {
    const status = error?.response?.status || 500
    const message = error?.response?.data || error?.message || 'Internal Server Error'
    console.error(chalk.red('[Proxy Error]'), chalk.yellow(status.toString()), message)
    return res.status(status).send(message)
  }

  const headers = request.headers
  const safeHeaders = _.omit(headers, ['transfer-encoding', 'connection', 'content-length'])
  res.set(safeHeaders)

  let data = request.data
  if (_.isNumber(data)) {
    data = data.toString()
  }

  return res.status(request.status ?? 200).send(data)
})

app.listen(PORT, (): void => {
  console.log(chalk.green('SERVER IS UP ON PORT:'), chalk.yellow(PORT))
})
