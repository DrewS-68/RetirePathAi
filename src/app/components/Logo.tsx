import logoImage from 'figma:asset/33ed1b78ef522a87437a8962b920d3992a5fd1d3.png';

export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <img 
      src={logoImage} 
      alt="RetirePath Logo" 
      className={className}
    />
  );
}