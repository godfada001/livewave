import authService from '../services/authService.js'

export async function register(
  req,
  res,
  next
) {
  try {
    const {
      email,
      password
    } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Email and password are required'
      })
    }

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Email and password must be strings'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters'
      })
    }

    const result =
      await authService.register({
        email,
        password
      })

    res.status(201).json({
      success: true,
      message:
        'Account created successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export async function login(
  req,
  res,
  next
) {
  try {
    const {
      email,
      password
    } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Email and password are required'
      })
    }

    const result =
      await authService.login({
        email,
        password
      })

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export async function getMe(
  req,
  res,
  next
) {
  try {
    const user =
      await authService.getUserById(
        req.user.id
      )

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}