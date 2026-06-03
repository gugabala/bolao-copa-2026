import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function RankingSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RankingPage() {
  const { data, isLoading } = trpc.aposta.ranking.useQuery()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ranking</h1>
      {isLoading ? (
        <RankingSkeleton />
      ) : !data ? null : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Classificação geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.map((usuario, index) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between py-3 px-4 border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold w-8 text-center text-muted-foreground">
                      {index + 1}º
                    </span>
                    {index === 0 && <span>🥇</span>}
                    {index === 1 && <span>🥈</span>}
                    {index === 2 && <span>🥉</span>}
                    <span className="font-medium">{usuario.nome}</span>
                  </div>
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    {usuario.totalPontos} pts
                  </Badge>
                </div>
              ))}
              {data.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma pontuação ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}