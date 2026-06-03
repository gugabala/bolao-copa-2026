import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../../bolao-copa-back/src/index'

export const trpc = createTRPCReact<AppRouter>()

export type { AppRouter }