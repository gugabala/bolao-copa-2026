import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink, TRPCClientError } from '@trpc/client'
import type { AppRouter } from '../../../bolao-copa-back/src/index'
import { handleTokenExpirado } from '@/hooks/useAuth'

export const trpc = createTRPCReact<AppRouter>()

export type { AppRouter }

export function criarTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3333/trpc',
        headers() {
          const token = localStorage.getItem('token')
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
        fetch: async (url, options) => {
          const res = await fetch(url, options)
          if (res.status === 401) {
            handleTokenExpirado()
          }
          return res
        },
      }),
    ],
  })
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof TRPCClientError && err.data?.code === 'UNAUTHORIZED'
}