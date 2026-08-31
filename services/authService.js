import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { usersCollection } from '../models/user.js'

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || '7d'
      }
    )
  }

  sanitizeUser(user) {
    return {
      id: user._id.toString(),
      email: user.email,
      favorites: user.favorites || []
    }
  }

  async register({ email, password }) {
    const users = usersCollection()

    const normalizedEmail =
      email.trim().toLowerCase()

    const existingUser =
      await users.findOne({
        email: normalizedEmail
      })

    if (existingUser) {
      const error = new Error(
        'An account with this email already exists'
      )

      error.statusCode = 409

      throw error
    }

    const passwordHash =
      await bcrypt.hash(password, 12)

    const newUser = {
      email: normalizedEmail,
      password: passwordHash,
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result =
      await users.insertOne(newUser)

    newUser._id = result.insertedId

    const token =
      this.generateToken(newUser)

    return {
      user: this.sanitizeUser(newUser),
      token
    }
  }

  async login({ email, password }) {
    const users = usersCollection()

    const normalizedEmail =
      email.trim().toLowerCase()

    const user =
      await users.findOne({
        email: normalizedEmail
      })

    if (!user) {
      const error = new Error(
        'Invalid email or password'
      )

      error.statusCode = 401

      throw error
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!passwordMatches) {
      const error = new Error(
        'Invalid email or password'
      )

      error.statusCode = 401

      throw error
    }

    const token =
      this.generateToken(user)

    return {
      user: this.sanitizeUser(user),
      token
    }
  }

  async getUserById(userId) {
    const { ObjectId } =
      await import('mongodb')

    const users = usersCollection()

    const user =
      await users.findOne({
        _id: new ObjectId(userId)
      })

    if (!user) {
      const error = new Error(
        'User not found'
      )

      error.statusCode = 404

      throw error
    }

    return this.sanitizeUser(user)
  }
}

export default new AuthService()