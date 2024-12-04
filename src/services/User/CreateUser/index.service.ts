import { v4 as uuidv4 } from 'uuid'
import * as Yup from 'yup'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { USERS_TABLE } from '../../../environments/usersTable'
import AppError from '../../../errors/appError'
import { User } from '../../../models/user'
import { GetUTCDateNow } from '../../../utils/getters/getUTCDateNow'
import { encryptPassword } from '../../../utils/helpers/encryptPassword'
import { DynamoDBHelper } from '../../Database'
import { ValidationSchema } from './schema'
import { Payload } from './types'

export class CreateUserService {
  private readonly dynamoDBHelper: DynamoDBHelper
  private readonly usersTable = USERS_TABLE
  private readonly emailIndex = 'emailIndex'

  constructor() {
    const dynamoDBClient = new DynamoDBClient()

    this.dynamoDBHelper = new DynamoDBHelper(dynamoDBClient)
  }

  public static async create(payload: Payload) {
    const service = new CreateUserService()

    return await service.execute(payload)
  }

  private async execute(payload: Payload) {
    await this.validationData(payload)

    const existingUser = await this.checkEmailExists(payload.email)

    if (existingUser) {
      throw new AppError('User already exists', 400)
    }

    const dateNow = await GetUTCDateNow()

    const encryptedPassword = encryptPassword(payload.password)

    delete payload.confirmPassword

    const userData: User = {
      ...payload,
      userId: uuidv4(),
      isConfirm: false,
      password: encryptedPassword,
      createdAt: dateNow.toISOString(),
      lastAccessAt: dateNow.toISOString(),
      updatedAt: dateNow.toISOString()
    }

    await this.dynamoDBHelper.saveItem<User>({
      tableName: this.usersTable,
      data: userData
    })

    const { password: _, userId: __, ...userWithoutPassword } = userData

    return userWithoutPassword
  }

  private async checkEmailExists(email: string) {
    const result = await this.dynamoDBHelper.queryItems<User>({
      tableName: this.usersTable,
      keyConditionExpression: 'email = :email',
      expressionAttributeValues: { ':email': email },
      indexName: this.emailIndex
    })

    return result.items.length > 0
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
