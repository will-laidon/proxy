import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import config from 'dotenv'
import * as _ from 'lodash'
import chalk from 'chalk'

config.config()

const app: Application = express()
const PORT = Number(process.env.PORT ?? 3001)
const SERV_URL = `${process.env.SERV_URL ?? ''}`

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
        'x-correlation-id': 'smdg.prestage@laidon.com',
        'x-csrf-token': '41099da88a6fa065-8Ia65gNIaR8bPjnvD0g-3qPj5bM',
        cookie: 'JSESSIONID=s%3AmEk47O_EXPGme1RGJ5l0RTT6NtKETUGW.JojqwOQqiwNkqbd6cChqPMNYKz7Wp5Uy61OJZGWdBXk; __VCAP_ID__=7516a7e5-1b26-4a7c-7e02-5309',
        Referer: 'https://smdg-prestage-simplemdg-web.cfapps.br10.hana.ondemand.com/main/index.html',
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
