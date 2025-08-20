// Verify lazy loading imports
const verifyLazyComponents = async () => {
  const components = [
    { name: 'HomePage', path: '../../pages/public/Home/ModernHome' },
    { name: 'PublicCoursesPage', path: '../../pages/public/Cursos/Cursos' },
    { name: 'LoginPage', path: '../../features/auth/pages/LoginPage' },
    { name: 'RegisterPage', path: '../../features/auth/pages/RegisterPage' },
    { name: 'ForgotPasswordPage', path: '../../features/auth/pages/ForgotPasswordPage' },
    { name: 'DashboardPage', path: '../../features/dashboard/pages/DashboardPage' },
    { name: 'AnalyticsPage', path: '../../features/dashboard/pages/AnalyticsPage' },
    { name: 'CoursesCatalogPage', path: '../../features/courses/pages/CoursesCatalogPage' },
    { name: 'CourseDetailPage', path: '../../features/courses/pages/CourseDetailPage' },
    { name: 'CreateCoursePage', path: '../../features/courses/pages/CreateCoursePage' },
    { name: 'LessonViewPage', path: '../../features/courses/pages/LessonViewPage' },
    { name: 'TeacherDashboardPage', path: '../../features/teacher/pages/TeacherDashboardPage' },
    { name: 'ProfilePage', path: '../../features/profile/pages/ProfilePage' },
    { name: 'SettingsPage', path: '../../features/profile/pages/SettingsPage' },
    { name: 'AdminDashboardPage', path: '../../features/admin/pages/AdminDashboardPage' },
    { name: 'UsersManagementPage', path: '../../features/admin/pages/UsersManagementPage' },
    { name: 'SystemSettingsPage', path: '../../features/admin/pages/SystemSettingsPage' },
    { name: 'ReportsPage', path: '../../features/reports/pages/ReportsPage' },
    { name: 'NotificationsPage', path: '../../features/notifications/pages/NotificationsPage' },
    { name: 'NotFoundPage', path: '../../shared/pages/NotFoundPage' },
    { name: 'UnauthorizedPage', path: '../../shared/pages/UnauthorizedPage' },
    { name: 'ServerErrorPage', path: '../../shared/pages/ServerErrorPage' }
  ];

  console.log('🔍 Verifying lazy loading components...\n');
  
  const results = [];
  
  for (const component of components) {
    try {
      // Dynamically import to verify the component can be loaded
      const module = await import(component.path);
      
      if (!module.default) {
        results.push({
          name: component.name,
          status: '❌',
          error: 'No default export'
        });
      } else if (typeof module.default !== 'function') {
        results.push({
          name: component.name,
          status: '⚠️',
          error: 'Default export is not a function/component'
        });
      } else {
        results.push({
          name: component.name,
          status: '✅',
          error: null
        });
      }
    } catch (error) {
      results.push({
        name: component.name,
        status: '❌',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Display results
  console.log('Component Loading Results:');
  console.log('==========================\n');
  
  const successful = results.filter(r => r.status === '✅').length;
  const warnings = results.filter(r => r.status === '⚠️').length;
  const failed = results.filter(r => r.status === '❌').length;
  
  results.forEach(result => {
    if (result.error) {
      console.log(`${result.status} ${result.name}: ${result.error}`);
    } else {
      console.log(`${result.status} ${result.name}`);
    }
  });
  
  console.log('\n==========================');
  console.log(`Summary: ${successful} successful, ${warnings} warnings, ${failed} failed`);
  
  if (failed > 0) {
    console.error('\n❌ Some components failed to load. Please check the errors above.');
  } else if (warnings > 0) {
    console.warn('\n⚠️ Some components have warnings. Please review them.');
  } else {
    console.log('\n✅ All components loaded successfully!');
  }
  
  return results;
};

// Run verification if this is the main module
if (import.meta.url === `file://${__filename}`) {
  verifyLazyComponents().catch(console.error);
}

export default verifyLazyComponents;