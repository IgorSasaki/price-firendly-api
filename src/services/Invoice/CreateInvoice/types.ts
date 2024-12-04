export interface Payload {
  invoiceDomain: string
}

export interface InvoiceItem {
  code: string
  description: string
  quantity: number
  totalValue: number
  unit: string
  unitValue: number
}
