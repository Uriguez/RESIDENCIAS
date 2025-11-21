using System;
using System.Collections.Generic;
using System.Text;

namespace SistemaCapacitacion.Core.ViewModels
{
    // Core/ViewModels/CommonDtos.cs

    public readonly record struct ActivityDto(
        string Actor,
        string Action,
        string Target,
        DateTime At
    );

    public readonly record struct CourseRankDto(
        string Title,
        string Category,
        int Completed,
        int Enrolled
    );

}
