import React from 'react';

class ErrorBoundary extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError() {

        return {
            hasError: true
        };
    }

    componentDidCatch(error, errorInfo) {

        console.error(
            'Global Error Boundary:',
            error,
            errorInfo
        );
    }

    render() {

        if (this.state.hasError) {

            return (

                <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">

                    <h1 className="text-4xl font-bold">
                        Something went wrong
                    </h1>

                    <p className="mt-4 text-ink-soft">
                        An unexpected error occurred.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-3 bg-ink text-paper"
                    >
                        Reload Page
                    </button>

                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;