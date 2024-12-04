import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import AppError from '../../errors/appError'
import { DynamoDBKey, PaginatedQueryResult } from './types'

export class DynamoDBHelper {
  private readonly dynamoDBClient: DynamoDBClient

  constructor(dynamoDBClient: DynamoDBClient) {
    this.dynamoDBClient = dynamoDBClient
  }

  public async saveItem<T>({
    tableName,
    data
  }: {
    tableName: string
    data: T
  }): Promise<void> {
    try {
      const params: PutItemCommandInput = {
        TableName: tableName,
        Item: marshall(data, { removeUndefinedValues: true })
      }

      const command = new PutItemCommand(params)
      await this.dynamoDBClient.send(command)
    } catch (error) {
      console.error({ saveItemError: error })
      throw new AppError('Error saving item to DynamoDB', 500)
    }
  }

  public async getItem<T>({
    tableName,
    key
  }: {
    tableName: string
    key: DynamoDBKey
  }): Promise<T | null> {
    try {
      const params: GetItemCommandInput = {
        TableName: tableName,
        Key: marshall(key)
      }

      const command = new GetItemCommand(params)
      const result = await this.dynamoDBClient.send(command)

      return result.Item ? (unmarshall(result.Item) as T) : null
    } catch (error) {
      console.error({ getItemError: error })
      throw new AppError('Error retrieving item from DynamoDB', 500)
    }
  }

  public async scanTable<T>({
    tableName
  }: {
    tableName: string
  }): Promise<{ items: T[] }> {
    try {
      const params: ScanCommandInput = {
        TableName: tableName
      }

      const command = new ScanCommand(params)
      const result = await this.dynamoDBClient.send(command)

      const items = result.Items
        ? result.Items.map(item => unmarshall(item) as T)
        : []

      return { items }
    } catch (error) {
      console.error({ scanTableError: error })
      throw new AppError('Error scanning DynamoDB table', 500)
    }
  }

  public async queryItems<T>({
    tableName,
    keyConditionExpression,
    expressionAttributeValues,
    indexName,
    lastEvaluatedKey
  }: {
    tableName: string
    keyConditionExpression: string
    expressionAttributeValues: DynamoDBKey
    indexName?: string
    lastEvaluatedKey?: DynamoDBKey
  }): Promise<PaginatedQueryResult<T>> {
    try {
      const params: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
        ...(indexName && { IndexName: indexName }),
        ...(lastEvaluatedKey && {
          ExclusiveStartKey: marshall(lastEvaluatedKey)
        })
      }

      const command = new QueryCommand(params)
      const result = await this.dynamoDBClient.send(command)

      const items = result.Items
        ? result.Items.map(item => unmarshall(item) as T)
        : []

      return {
        items,
        lastEvaluatedKey: result.LastEvaluatedKey
          ? unmarshall(result.LastEvaluatedKey)
          : undefined
      }
    } catch (error) {
      console.error({ queryItemsError: error })
      throw new AppError('Error querying items from DynamoDB', 500)
    }
  }

  public async updateItem({
    tableName,
    key,
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  }: {
    tableName: string
    key: DynamoDBKey
    updateExpression: string
    expressionAttributeValues: DynamoDBKey
    expressionAttributeNames: Record<string, string>
  }): Promise<void> {
    try {
      const params: UpdateItemCommandInput = {
        TableName: tableName,
        Key: marshall(key),
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues, {
          removeUndefinedValues: true
        })
      }

      const command = new UpdateItemCommand(params)
      await this.dynamoDBClient.send(command)
    } catch (error) {
      console.error({ updateItemError: error })
      throw new AppError('Error updating item in DynamoDB', 500)
    }
  }

  public async deleteItem({
    tableName,
    key
  }: {
    tableName: string
    key: DynamoDBKey
  }): Promise<void> {
    try {
      const params: DeleteItemCommandInput = {
        TableName: tableName,
        Key: marshall(key)
      }

      const command = new DeleteItemCommand(params)
      await this.dynamoDBClient.send(command)
    } catch (error) {
      console.error({ deleteItemError: error })
      throw new AppError('Error deleting item from DynamoDB', 500)
    }
  }
}
