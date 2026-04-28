export interface BannerProps {
  backgroundImage: string;
  subtitle?: string;
  title: string;
  description: string;
}

export default function Banner({
  backgroundImage,
  subtitle,
  title,
  description,
}: BannerProps) {
  return (
    <section
      className="relative w-full min-h-[300px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center px-6">
        {subtitle && (
          <div className="text-white text-xl mb-2 font-semibold">{subtitle}</div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-white text-md">
          {description}
        </p>
      </div>
    </section>
  );
}
