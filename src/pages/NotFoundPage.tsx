import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center 
                    bg-background p-4"
    >
      <div className="text-center space-y-4">
        <p className="text-8xl font-black text-brand-600">404</p>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-default-500 text-sm max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={ROUTES.DASHBOARD.HOME}
          className="inline-block px-4 py-2 bg-brand-600 text-white 
                     rounded-lg hover:bg-brand-700 transition-colors text-sm"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
