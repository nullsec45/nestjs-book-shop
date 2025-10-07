import { Transform } from 'class-transformer'
// import { ApiProperty } from '@nestjs/swagger'

export class PaginationDTO {
//   @ApiProperty({
//     example: '1',
//     required: true
//   })
  @Transform(({ value }) => parseInt(value))
  page?: number

//   @ApiProperty({
//     example: '10',
//     required: true
//   })
  @Transform(({ value }) => parseInt(value))
  perPage?: number
}
