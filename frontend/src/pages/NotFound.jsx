import { Link } from 'react-router-dom';

const NotFound = () => {

    return (

        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">

            <h1 className="text-7xl font-bold text-ink">
                404
            </h1>

            <p className="mt-4 text-xl font-medium">
                Page not found
            </p>

            <p className="mt-2 text-ink-soft max-w-md">
                The page you are looking for does not exist or may have been moved.
            </p>

            <Link
                to="/"
                className="mt-6 px-6 py-3 bg-ink text-paper hover:bg-navy transition-colors"
            >
                Back to Home
            </Link>

        </div>
    );
};

export default NotFound;