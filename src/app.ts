import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'
import { PORT, SV_URL } from './config'

config.config()

const app: Application = express()

app.use(express.json())

app.use('/*', async (req: Request, res: Response) => {
  let request

  try {
    console.log(chalk.magenta('[Proxy]', chalk.cyan(`${SV_URL}${req.originalUrl}`)))

    request = await axios.request({
      method: req.method,
      url: `${SV_URL}${req.originalUrl}`,
      data: req.body,
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en',
        'application-interface-key': '52ve7fwy',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'x-correlation-id': 'butterball.dev@laidon.com',
        'x-csrf-token': '202f9a722d206bb9-eEP3jsSmqgNmm6-GEfX8ZEkuadU',
        cookie: 'JSESSIONID=s%3ArxnXFeojaI9J2igE2EY9sMzthP_6wZyl.nIYZTeviUozln%2BRvbib9KxMo%2FY0PrbzLl68ZfV2dlrg; __VCAP_ID__=44cb6fe2-5f05-47ce-6da2-341f',
        Referer: 'https://butterball-dev-simplemdg-web.cfapps.us21.hana.ondemand.com/main/index.html',
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
  console.log(chalk.white('SV_URL:'), chalk.yellow(SV_URL))
})
