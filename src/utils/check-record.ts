export function isRecordNotFound(record: any): boolean {
  return [undefined, null].includes(record);
}
