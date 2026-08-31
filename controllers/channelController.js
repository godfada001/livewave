import channelService from '../services/iptv/channelService.js'

export async function getChannels(
  req,
  res,
  next
) {
  try {
    const {
      country,
      category
    } = req.query

    const channels =
      await channelService.getAll({
        country,
        category
      })

    res.json({
      success: true,
      count: channels.length,
      data: channels
    })
  } catch (error) {
    next(error)
  }
}

export async function getChannel(
  req,
  res,
  next
) {
  try {
    const channel =
      await channelService.getById(
        req.params.id
      )

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      })
    }

    res.json({
      success: true,
      data: channel
    })
  } catch (error) {
    next(error)
  }
}

export async function searchChannels(
  req,
  res,
  next
) {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const channels =
      await channelService.search(q)

    res.json({
      success: true,
      count: channels.length,
      data: channels
    })
  } catch (error) {
    next(error)
  }
}