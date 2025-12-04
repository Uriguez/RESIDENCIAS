namespace SistemaCapacitacion.Core.ViewModels

{

	public class EmployeeCourseItemViewModel

	{

	
			public Guid IdCourse { get; set; }
			public string Title { get; set; } = string.Empty;
			public string Description { get; set; } = string.Empty;

			public int Progress { get; set; } // 0–100
			public bool IsRequired { get; set; } // Obligatorio / Opcional
		

	}



	public class EmployeeDashboardViewModel

	{

		public string FullName { get; set; } = string.Empty;

		public IList<EmployeeCourseItemViewModel> AssignedCourses { get; set; }

			= new List<EmployeeCourseItemViewModel>();

	}

	public class EmployeeCourseViewModel
	{
		public int IdCourse { get; set; }
		public string Title { get; set; }
		public string Description { get; set; }
		public int Progress { get; set; }
		public bool IsRequired { get; set; }
	}
}