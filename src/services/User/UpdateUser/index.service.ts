import * as Yup from 'yup'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { USERS_TABLE } from '../../../environments/usersTable'
import AppError from '../../../errors/appError'
import { User } from '../../../models/user'
import { GetUTCDateNow } from '../../../utils/getters/getUTCDateNow'
import { DynamoDBHelper } from '../../Database'
import { ValidationSchema } from './schema'
import { Payload } from './types'

export class UpdateUserService {
  private readonly dynamoDBHelper: DynamoDBHelper
  private readonly usersTable = USERS_TABLE

  constructor() {
    const dynamoDBClient = new DynamoDBClient()

    this.dynamoDBHelper = new DynamoDBHelper(dynamoDBClient)
  }

  public static async create(payload: Payload) {
    const service = new UpdateUserService()

    return await service.execute(payload)
  }

  private async execute(payload: Payload) {
    await this.validationData(payload)

    const userExists = await this.checkUserExists(payload.userId)

    if (!userExists) {
      throw new AppError('User does not exist', 404)
    }

    const dateNow = await GetUTCDateNow()
    payload.updatedAt = dateNow.toISOString()

    const updatedUser = (await this.updateUser(payload)) as User

    const { password: _, userId: __, ...userWithoutPassword } = updatedUser

    return userWithoutPassword
  }

  private async checkUserExists(userId: string) {
    const user = await this.dynamoDBHelper.getItem<User>({
      tableName: this.usersTable,
      key: { userId }
    })

    return !!user
  }

  private async updateUser(payload: Payload) {
    const { userId, ...updatedData } = payload

    await this.dynamoDBHelper.updateItem({
      tableName: this.usersTable,
      key: { userId },
      updateExpression: this.buildUpdateExpression(updatedData),
      expressionAttributeValues:
        this.buildExpressionAttributeValues(updatedData),
      expressionAttributeNames: this.buildExpressionAttributeNames(updatedData)
    })

    const updatedUser = await this.dynamoDBHelper.getItem<User>({
      tableName: this.usersTable,
      key: { userId }
    })

    return updatedUser
  }

  private buildUpdateExpression(updatedData: Partial<Payload>): string {
    const updateFields = Object.keys(updatedData).map(
      field => `#${field} = :${field}`
    )
    return `SET ${updateFields.join(', ')}`
  }

  private buildExpressionAttributeValues(
    updatedData: Partial<Payload>
  ): Record<string, any> {
    return Object.entries(updatedData).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`:${key}`]: value
      }),
      {}
    )
  }

  private buildExpressionAttributeNames(
    updatedData: Partial<Payload>
  ): Record<string, string> {
    return Object.keys(updatedData).reduce(
      (acc, field) => ({
        ...acc,
        [`#${field}`]: field
      }),
      {}
    )
  }

  private async validationData(payload: Payload) {
    try {
      await ValidationSchema.validate(payload, {
        abortEarly: true
      })
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        const validationErrors = validationError.errors.join(', ')

        throw new AppError(validationErrors, 400)
      }

      throw validationError
    }
  }
}
