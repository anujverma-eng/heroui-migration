import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <p className="text-6xl">🚫</p>
        <h1 className="text-2xl font-bold text-foreground">Unauthorized</h1>
        <p className="text-default-500 text-sm max-w-sm mx-auto">
          You don't have permission to access this area.
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="inline-block px-4 py-2 bg-brand-600 text-white 
                     rounded-lg hover:bg-brand-700 transition-colors text-sm"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
