import logoImage from 'figma:asset/33ed1b78ef522a87437a8962b920d3992a5fd1d3.png';

export function LogoHeaderRight() {
  return (
    <div className="bg-white p-8">
      <div className="relative">
        <h1 className="text-3xl font-bold text-[#1f2937]">RetirePath</h1>
        <img 
          src={logoImage} 
          alt="RetirePath Logo" 
          className="size-[120px] rounded-lg absolute top-0 right-0"
        />
      </div>
      <p className="text-sm text-[#6b7280] mt-12">Your Journey to the Perfect Retirement Village</p>
    </div>
  );
}