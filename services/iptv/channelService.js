import iptvService from './iptvService.js'

class ChannelService {
  async getAll({ country, category } = {}) {
    const data = await iptvService.getData()

    let channels = data.channelsWithLogos

    if (country) {
      const normalizedCountry = country.toUpperCase()

      channels = channels.filter(
        channel =>
          channel.country?.toUpperCase() ===
          normalizedCountry
      )
    }

    if (category) {
      channels = channels.filter(
        channel =>
          channel.categories?.includes(category)
      )
    }

    return channels.map(channel => ({
      ...channel
    }))
  }

  async getById(id) {
    const data = await iptvService.getData()

    const channel = data.channelsWithLogos
      .find(channel => channel.id === id)

    return channel
      ? { ...channel }
      : null
  }

async search(query) {
  const data = await iptvService.getData()

  const search = query.toLowerCase().trim()

  return data.channelSearchIndex
    .filter(channel => {
      const nameMatch =
        channel.searchName.includes(search)

      const alternateMatch =
        channel.searchAltNames.some(name =>
          name.includes(search)
        )

      return nameMatch || alternateMatch
    })
    .map(channel => {
      const {
        searchName,
        searchAltNames,
        ...channelData
      } = channel

      return channelData
    })
  }
}

export default new ChannelService()