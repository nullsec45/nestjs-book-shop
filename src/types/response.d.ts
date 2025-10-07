import { User } from '@prisma/client'

export interface ResponseData {
  status: boolean
  statusCode: number
  message: string
  data?: object | Array | null
}

export interface ResponseDataPaginate extends Omit<ResponseData, 'data'> {
  data?: {
    page: number
    items: Array
    perPage: number
    totalPages: number
    totalItems: number
  }
}