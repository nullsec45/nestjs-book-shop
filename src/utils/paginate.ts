import { PaginationDTO } from '@/dto'

export class Paginate {
  page: number
  take: number
  skip: number

  constructor({ page, perPage }: PaginationDTO) {
    this.page = page ?? 1
    this.take = perPage ?? 10
    this.skip = this.page <= 1 ? 0 : this.page * this.take - perPage
  }
}
