interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-10 h-10" }: LogoProps) {
  return (
    <div className={`${className} flex-shrink-0`}>
      <img src="/pwa-192x192.png" alt="CALMe Logo" className="h-full w-full object-contain" />
    </div>
  );
}
