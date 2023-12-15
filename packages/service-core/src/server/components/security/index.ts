export function maskPassword(url: string) {
  let maskedUrl = url
  if (url) {
    const match = url.match(/(?<=:\/\/)(.*?)(?=@)/)
    if (match) {
      const [, pwd] = match[0].split(':')
      if (pwd) {
        maskedUrl = url.replace(pwd, '****')
      }
    }
  }
  return maskedUrl
}

export async function doSecurityCheck(req, res) {
  const apiKey = req.headers['x-api-key'] || req.query['x-api-key']
  if (apiKey === process.env.ACCESS_TOKEN) {
    return true
  }
  res.status(401).json({ status: false, message: 'Unauthorized!' })
  return false
}
