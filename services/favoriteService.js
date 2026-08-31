import { ObjectId } from 'mongodb'
import { usersCollection } from '../models/user.js'

class FavoriteService {
  async getFavorites(userId) {
    const users = usersCollection()

    const user = await users.findOne(
      {
        _id: new ObjectId(userId)
      },
      {
        projection: {
          favorites: 1
        }
      }
    )

    if (!user) {
      throw new Error('User not found')
    }

    return user.favorites || []
  }

  async addFavorite(userId, channelId) {
    const users = usersCollection()

    const result = await users.updateOne(
      {
        _id: new ObjectId(userId)
      },
      {
        $addToSet: {
          favorites: channelId
        }
      }
    )

    if (result.matchedCount === 0) {
      throw new Error('User not found')
    }

    return this.getFavorites(userId)
  }

  async removeFavorite(userId, channelId) {
    const users = usersCollection()

    const result = await users.updateOne(
      {
        _id: new ObjectId(userId)
      },
      {
        $pull: {
          favorites: channelId
        }
      }
    )

    if (result.matchedCount === 0) {
      throw new Error('User not found')
    }

    return this.getFavorites(userId)
  }

  async isFavorite(userId, channelId) {
    const users = usersCollection()

    const user = await users.findOne({
      _id: new ObjectId(userId),
      favorites: channelId
    })

    return !!user
  }
}

export default new FavoriteService()