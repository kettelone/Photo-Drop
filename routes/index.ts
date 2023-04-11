import express from 'express'
import photographerRouter from './photographerRouter'
import appUserRouter from './appUserRouter'

const router = express.Router()

router.use('/photographer', photographerRouter)
router.use('/app-user', appUserRouter)

export default router
