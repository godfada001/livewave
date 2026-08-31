import favoriteService from '../services/favoriteService.js'

export async function getFavorites(
  req,
  res,
  next
) {
  try {
    const favorites =
      await favoriteService.getFavorites(
        req.user.id
      )

    res.json({
      success: true,
      count: favorites.length,
      data: favorites
    })
  } catch (error) {
    next(error)
  }
}

export async function addFavorite(
  req,
  res,
  next
) {
  try {
    const { channelId } = req.params

    const favorites =
      await favoriteService.addFavorite(
        req.user.id,
        channelId
      )

    res.json({
      success: true,
      message: 'Channel added to favorites',
      data: favorites
    })
  } catch (error) {
    next(error)
  }
}

export async function removeFavorite(
  req,
  res,
  next
) {
  try {
    const { channelId } = req.params

    const favorites =
      await favoriteService.removeFavorite(
        req.user.id,
        channelId
      )

    res.json({
      success: true,
      message: 'Channel removed from favorites',
      data: favorites
    })
  } catch (error) {
    next(error)
  }
}

export async function checkFavorite(
  req,
  res,
  next
) {
  try {
    const { channelId } = req.params

    const favorite =
      await favoriteService.isFavorite(
        req.user.id,
        channelId
      )

    res.json({
      success: true,
      data: {
        favorite
      }
    })
  } catch (error) {
    next(error)
  }
}