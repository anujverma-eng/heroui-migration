import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './footer';
import { ROUTES } from '@/constants/routes';

export function PublicLayout() {
  // If route is login route, don't show the footer
  const location = useLocation();
  const isLoginRoute = location.pathname === ROUTES.LOGIN;
  if (isLoginRoute) {
    return (
      <>
        <Outlet />
      </>
    );
  }
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}
