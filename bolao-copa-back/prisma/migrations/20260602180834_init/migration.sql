-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USUARIO');

-- CreateEnum
CREATE TYPE "FaseGrupo" AS ENUM ('GRUPOS', 'OITAVAS', 'QUARTAS', 'SEMIFINAL', 'TERCEIRO_LUGAR', 'FINAL');

-- CreateEnum
CREATE TYPE "SituacaoPartida" AS ENUM ('AGENDADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "TipoPontuacao" AS ENUM ('EXATO', 'VENCEDOR', 'EMPATE', 'ERRO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'USUARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_torneio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fase" "FaseGrupo" NOT NULL,
    "rotulo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "grupos_torneio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" TEXT NOT NULL,
    "grupoTorneioId" TEXT NOT NULL,
    "timeCasa" TEXT NOT NULL,
    "timeVisitante" TEXT NOT NULL,
    "dataHora" TIMESTAMPTZ NOT NULL,
    "prazoAposta" TIMESTAMPTZ NOT NULL,
    "golsCasa" INTEGER,
    "golsVisitante" INTEGER,
    "situacao" "SituacaoPartida" NOT NULL DEFAULT 'AGENDADA',
    "aDefinir" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apostas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "golsCasa" INTEGER NOT NULL,
    "golsVisitante" INTEGER NOT NULL,
    "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontuacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "apostoId" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,
    "tipo" "TipoPontuacao" NOT NULL,
    "calculadoEm" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pontuacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "apostas_usuarioId_partidaId_key" ON "apostas"("usuarioId", "partidaId");

-- CreateIndex
CREATE UNIQUE INDEX "pontuacoes_apostoId_key" ON "pontuacoes"("apostoId");

-- CreateIndex
CREATE UNIQUE INDEX "pontuacoes_usuarioId_partidaId_key" ON "pontuacoes"("usuarioId", "partidaId");

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_grupoTorneioId_fkey" FOREIGN KEY ("grupoTorneioId") REFERENCES "grupos_torneio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apostas" ADD CONSTRAINT "apostas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apostas" ADD CONSTRAINT "apostas_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontuacoes" ADD CONSTRAINT "pontuacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontuacoes" ADD CONSTRAINT "pontuacoes_apostoId_fkey" FOREIGN KEY ("apostoId") REFERENCES "apostas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontuacoes" ADD CONSTRAINT "pontuacoes_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
