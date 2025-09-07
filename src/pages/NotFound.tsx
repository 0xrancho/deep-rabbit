import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gabi-purple/5" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 gabi-gradient rounded-full blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-user-accent/20 rounded-full blur-3xl opacity-20" />

      <div className="text-center relative z-10">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">404</h1>
        <p className="text-xl text-text-secondary mb-4">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-user-accent hover:text-user-accent-bright underline transition-colors"
        >
          Return to Assessment
        </a>
      </div>
    </div>
  );
};

export default NotFound;
