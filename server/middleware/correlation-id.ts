import { randomUUID } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    correlationId?: string
  }
}

const HEADER_NAME = 'x-request-id'

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const headerId = (req.headers[HEADER_NAME] || req.headers[HEADER_NAME.toUpperCase()]) as string | undefined
  const id = (headerId && typeof headerId === 'string' && headerId.trim().length > 0) ? headerId.trim() : randomUUID()
  req.correlationId = id
  res.setHeader(HEADER_NAME, id)
  next()
}
