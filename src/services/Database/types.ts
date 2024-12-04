export type DynamoDBKey = Record<string, any>

export interface PaginatedQueryResult<T> {
  items: T[]
  lastEvaluatedKey?: DynamoDBKey
}
