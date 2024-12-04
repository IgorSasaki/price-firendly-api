import axios from 'axios'
import * as cheerio from 'cheerio'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { DynamoDBHelper } from '../../Database'
import { InvoiceItem, Payload } from './types'

class CreateInvoiceService {
  private readonly dynamoDBHelper: DynamoDBHelper

  constructor() {
    const dynamoDBClient = new DynamoDBClient({})

    this.dynamoDBHelper = new DynamoDBHelper(dynamoDBClient)
  }

  public static async create(payload: Payload) {
    const service = new CreateInvoiceService()

    return await service.execute(payload)
  }

  private async execute(payload: Payload) {
    const invoiceData = await this.fetchInvoiceData(payload.invoiceDomain)

    // await this.saveInvoiceData(invoiceData)

    return invoiceData
  }

  private async fetchInvoiceData(url: string) {
    const adjustedUrl = this.adjustUrl(url)
    const response = await axios.get(adjustedUrl)
    const html = response.data

    const $ = cheerio.load(html)
    const items: InvoiceItem[] = []

    $('table#tabResult tr').each((_, element) => {
      const description = $(element).find('span.txtTit').first().text().trim()

      const codeText = $(element).find('span.RCod').text().trim()
      const codeMatch = codeText.match(/Código:\s*(\d+)/)
      const code = codeMatch ? codeMatch[1] : ''

      const quantityText = $(element).find('span.Rqtd').text().trim()
      const quantityMatch = quantityText.match(/Qtde\.\s*:\s*(\d+(\.\d+)?)/)
      const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 0

      const unit = $(element).find('span.RUN').text().replace('UN:', '').trim()

      const unitValueText = $(element).find('span.RvlUnit').text().trim()
      const unitValueMatch = unitValueText.match(/Vl\. Unit\.\s*:\s*([\d.,]+)/)
      const unitValue = unitValueMatch
        ? parseFloat(unitValueMatch[1].replace('.', '').replace(',', '.'))
        : 0

      const totalValueText = $(element)
        .find('td.noWrap span.valor')
        .text()
        .trim()
      const totalValue = totalValueText
        ? parseFloat(totalValueText.replace('.', '').replace(',', '.'))
        : 0

      if (description) {
        const item: InvoiceItem = {
          description,
          code,
          quantity,
          unit,
          unitValue,
          totalValue
        }
        items.push(item)
      }
    })

    return items
  }

  private adjustUrl(url: string): string {
    return url
  }

  // private async saveInvoiceData(invoiceData: any) {
  //   // Implemente a lógica para salvar os dados no DynamoDB
  //   // Por exemplo:
  //   await this.dynamoDBHelper.putItem('InvoicesTable', invoiceData)
  // }
}

export default CreateInvoiceService
