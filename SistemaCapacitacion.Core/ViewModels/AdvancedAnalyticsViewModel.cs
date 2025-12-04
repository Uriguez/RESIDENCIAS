using System;
using System.Collections.Generic;

namespace SistemaCapacitacion.Core.ViewModels
{
    public class AdvancedAnalyticsViewModel
    {
        // ─────────── Tarjetas superiores ───────────
        public int TotalUsers { get; set; }
        public int ActiveUsersLast30Days { get; set; }      // usuarios con progreso en últimos 30 días
        public double ActiveUsersDeltaPercent { get; set; } // vs período anterior (puede ser 0 si no hay datos previos)

        public double GlobalCompletionRate { get; set; }    // % de UserCourse con Status = "Completed"
        public double CompletionDeltaPercent { get; set; }

        public double AverageScore { get; set; }            // promedio de Progress.Score (0–100)
        public double ScoreDeltaPercent { get; set; }

        public double TotalLearningHours { get; set; }      // sum(TimeSpentMinutes)/60
        public double LearningHoursDeltaPercent { get; set; }

        // ─────────── Resumen general (mensual) ───────────
        public IReadOnlyList<MonthlyEnrollmentPoint> MonthlyEnrollments { get; set; }
            = Array.Empty<MonthlyEnrollmentPoint>();

        public IReadOnlyList<MonthlyUserGrowthPoint> MonthlyUserGrowth { get; set; }
            = Array.Empty<MonthlyUserGrowthPoint>();

        // ─────────── Análisis por curso ───────────
        public IReadOnlyList<CoursePerformanceItem> CoursePerformance { get; set; }
            = Array.Empty<CoursePerformanceItem>();

        public IReadOnlyList<CourseScoreItem> CourseScores { get; set; }
            = Array.Empty<CourseScoreItem>();

        // ─────────── Participación por departamento ───────────
        public IReadOnlyList<DepartmentParticipationItem> DepartmentParticipation { get; set; }
            = Array.Empty<DepartmentParticipationItem>();

        // ─────────── Progreso temporal (semanal) ───────────
        public IReadOnlyList<WeeklyProgressPoint> WeeklyProgress { get; set; }
            = Array.Empty<WeeklyProgressPoint>();

        public WeeklyProgressSummary WeeklySummary { get; set; } = new WeeklyProgressSummary();
    }

    public class MonthlyEnrollmentPoint
    {
        public string Label { get; set; } = ""; // "Ene 2025"
        public int Enrolled { get; set; }
        public int Completed { get; set; }
    }

    public class MonthlyUserGrowthPoint
    {
        public string Label { get; set; } = ""; // "Ene 2025"
        public int NewUsers { get; set; }
        public int AccumulatedUsers { get; set; }
    }

    public class CoursePerformanceItem
    {
        public string CourseTitle { get; set; } = "";
        public int Enrolled { get; set; }
        public int Completed { get; set; }

        public double CompletionRate =>
            Enrolled == 0 ? 0 : Math.Round((double)Completed / Enrolled * 100, 1);
    }

    public class CourseScoreItem
    {
        public string CourseTitle { get; set; } = "";
        public double AverageScore { get; set; } // 0–100
    }

    public class DepartmentParticipationItem
    {
        public string DepartmentName { get; set; } = "";
        public int UsersCount { get; set; }
        public double Percent { get; set; } // % sobre total de usuarios
    }

    public class WeeklyProgressPoint
    {
        public string Label { get; set; } = ""; // "Sem 1", "Sem 2", ...
        public double AvgProgressPercent { get; set; }
    }

    public class WeeklyProgressSummary
    {
        public double ThisWeekPercent { get; set; }
        public double BestWeekPercent { get; set; }
        public string BestWeekLabel { get; set; } = "";
        public double TrendPercent { get; set; } // diferencia vs semana anterior
    }
}
