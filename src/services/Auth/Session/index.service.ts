import { sign } from 'jsonwebtoken'
import * as Yup from 'yup'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import authConfig from '../../../config/auth'
import { USERS_TABLE } from '../../../environments/usersTable'
import AppError from '../../../errors/appError'
import { User } from '../../../models/user'
import { GetUTCDateNow } from '../../../utils/getters/getUTCDateNow'
import { encryptPassword } from '../../../utils/helpers/encryptPassword'
import { DynamoDBHelper } from '../../Database'
import { ValidationSchema } from './schema'
import { Payload } from './types'

export class SessionClass {
  private readonly dynamoDBHelper: DynamoDBHelper
  private readonly usersTable = USERS_TABLE
  private readonly emailIndex = 'emailIndex'

  constructor() {
    const dynamoDBClient = new DynamoDBClient()

    this.dynamoDBHelper = new DynamoDBHelper(dynamoDBClient)
  }

  public static async create(payload: Payload) {
    const service = new SessionClass()

    return await service.execute(payload)
  }

  private async execute(payload: Payload) {
    await this.validationData(payload)

    const userData = await this.getUserByEmail(payload.email)

    if (!userData) {
      throw new AppError('User already exists', 400)
    }

    const encryptedPassword = encryptPassword(payload.password)

    if (userData.password !== encryptedPassword) {
      throw new AppError('Invalid password', 401)
    }

    if (!userData.isConfirm) {
      this.confirmUser(userData.userId)
    }

    await this.updateLastAccess(userData.userId)

    const { password: _, userId: __, ...userWithoutPassword } = userData

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({}, secret, {
      subject: userData.userId,
      expiresIn
    })

    return { user: userWithoutPassword, token }
  }

  private async getUserByEmail(email: string) {
    const result = await this.dynamoDBHelper.queryItems<User>({
      tableName: this.usersTable,
      keyConditionExpression: 'email = :email',
      expressionAttributeValues: { ':email': email },
      indexName: this.emailIndex
    })

    return result.items.length > 0 ? result.items[0] : null
  }

  private async confirmUser(userId: string) {
    await this.dynamoDBHelper.updateItem({
      tableName: this.usersTable,
      key: { userId },
      updateExpression: 'SET #isConfirm = :isConfirm',
      expressionAttributeNames: { '#isConfirm': 'isConfirm' },
      expressionAttributeValues: { ':isConfirm': true }
    })
  }

  private async updateLastAccess(userId: string) {
    const lastAccessAt = await GetUTCDateNow()

    await this.dynamoDBHelper.updateItem({
      tableName: this.usersTable,
      key: { userId },
      updateExpression: 'SET #lastAccessAt = :lastAccessAt',
      expressionAttributeNames: { '#lastAccessAt': 'lastAccessAt' },
      expressionAttributeValues: { ':lastAccessAt': lastAccessAt.toISOString() }
    })
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
