import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera el resumen consolidado de estadísticas globales de la Feria de Saberes:
   * - Afluencia de visitantes (Check-in, franja horaria pico, distribución de categorías)
   * - Proyectos (totales, proyecto más valorado, ranking, desglose por orientación y ciclo)
   * - Métricas de comunidad (expositores, reseñas, usuarios)
   */
  async getDashboardReportes() {
    // 1. Estadísticas de Check-in
    const [totalGrupos, checkinAggregate, checkinPorCategoria, allCheckins] =
      await Promise.all([
        this.prisma.checkin.count(),
        this.prisma.checkin.aggregate({
          _sum: { integrantes: true },
        }),
        this.prisma.checkin.groupBy({
          by: ['categoria'],
          _sum: { integrantes: true },
          _count: { id: true },
        }),
        this.prisma.checkin.findMany({
          select: { integrantes: true, created_at: true, categoria: true },
          orderBy: { created_at: 'desc' },
        }),
      ]);

    const totalAsistentes = checkinAggregate._sum.integrantes ?? 0;

    // Categoría con mayor afluencia
    let categoriaTop = {
      categoria: 'Sin datos',
      total: 0,
      porcentaje: 0,
    };

    const categoriasFormateadas = checkinPorCategoria.map((cat) => {
      const cant = cat._sum.integrantes ?? 0;
      const pct =
        totalAsistentes > 0 ? Math.round((cant / totalAsistentes) * 100) : 0;

      if (cant > categoriaTop.total) {
        categoriaTop = {
          categoria: cat.categoria || 'otro',
          total: cant,
          porcentaje: pct,
        };
      }

      return {
        categoria: cat.categoria || 'otro',
        totalPersonas: cant,
        totalGrupos: cat._count.id,
        porcentaje: pct,
      };
    });

    // Franja horaria con mayor ingreso
    const conteoHoras: Record<string, number> = {};
    for (const c of allCheckins) {
      if (c.created_at) {
        const h = new Date(c.created_at).getHours();
        const claveHora = `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00 hs`;
        conteoHoras[claveHora] =
          (conteoHoras[claveHora] || 0) + (c.integrantes || 1);
      }
    }

    let horarioPico = { franja: 'Sin registros aún', total: 0 };
    for (const [franja, cant] of Object.entries(conteoHoras)) {
      if (cant > horarioPico.total) {
        horarioPico = { franja, total: cant };
      }
    }

    // 2. Estadísticas de Proyectos y Comunidad
    const [
      totalProyectos,
      totalExpositores,
      totalResenas,
      totalUsuarios,
      topProyecto,
      rankingProyectos,
      proyectosPorDivision,
    ] = await Promise.all([
      this.prisma.proyectos.count(),
      this.prisma.expositores.count(),
      this.prisma.resenas_proyectos.count(),
      this.prisma.usuarios.count(),
      this.prisma.proyectos.findFirst({
        orderBy: { valoracion: 'desc' },
        include: {
          division: true,
          expositores: true,
        },
      }),
      this.prisma.proyectos.findMany({
        take: 5,
        orderBy: { valoracion: 'desc' },
        select: {
          id: true,
          titulo: true,
          valoracion: true,
          division: {
            select: {
              anio: true,
              division: true,
              orientacion: true,
              ciclo: true,
            },
          },
          _count: {
            select: { expositores: true, resenas_proyectos: true },
          },
        },
      }),
      this.prisma.proyectos.findMany({
        orderBy: [{ valoracion: 'desc' }, { id: 'asc' }],
        select: {
          id: true,
          titulo: true,
          valoracion: true,
          division: {
            select: {
              anio: true,
              division: true,
              orientacion: true,
              ciclo: true,
            },
          },
        },
      }),
    ]);

    // Conteo por orientación y por ciclo
    const porOrientacion: Record<string, number> = {
      informatica: 0,
      electricidad: 0,
    };
    const porCiclo: Record<string, number> = {
      Basico: 0,
      Superior: 0,
    };
    const masVotadoPorCiclo: Record<
      'Basico' | 'Superior',
      | {
          id: number;
          titulo: string;
          valoracion: number;
          division: string;
        }
      | null
    > = {
      Basico: null,
      Superior: null,
    };

    proyectosPorDivision.forEach((p) => {
      if (p.division?.orientacion) {
        porOrientacion[p.division.orientacion] =
          (porOrientacion[p.division.orientacion] || 0) + 1;
      }
      if (p.division?.ciclo) {
        porCiclo[p.division.ciclo] = (porCiclo[p.division.ciclo] || 0) + 1;
        const ciclo = p.division.ciclo;

        if (
          ciclo === 'Basico' ||
          ciclo === 'Superior'
        ) {
          const ganadorActual = masVotadoPorCiclo[ciclo];
          if (!ganadorActual || (p.valoracion ?? 0) > ganadorActual.valoracion) {
            masVotadoPorCiclo[ciclo] = {
              id: p.id,
              titulo: p.titulo,
              valoracion: p.valoracion ?? 0,
              division: `${p.division.anio} "${p.division.division || ''}" - ${p.division.orientacion || 'Sin orientación'}`,
            };
          }
        }
      }
    });

    return {
      checkin: {
        totalAsistentes,
        totalGrupos,
        categoriaTop,
        horarioPico,
        porCategoria: categoriasFormateadas,
      },
      proyectos: {
        totalProyectos,
        proyectoMasValorado: topProyecto
          ? {
              id: topProyecto.id,
              titulo: topProyecto.titulo,
              valoracion: topProyecto.valoracion ?? 0,
              division: topProyecto.division
                ? `${topProyecto.division.anio}° "${topProyecto.division.division || ''}" - ${topProyecto.division.orientacion}`
                : 'Sin división',
              expositores: topProyecto.expositores.map(
                (e) => e.nombre_completo,
              ),
            }
          : null,
        ranking: rankingProyectos.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          valoracion: p.valoracion ?? 0,
          division: p.division
            ? `${p.division.anio}° ${p.division.orientacion}`
            : 'Sin división',
          expositoresCount: p._count.expositores,
          resenasCount: p._count.resenas_proyectos,
        })),
        porOrientacion,
        porCiclo,
        masVotadoPorCiclo,
      },
      comunidad: {
        totalExpositores,
        totalResenas,
        totalUsuarios,
      },
    };
  }
}
