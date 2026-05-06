export interface UniversityCardProps {
  id: string;
  image: string;
  name: string;
  city: string;
  programs: string[];
  passingScore: string;
  onViewDetails: (id: string) => void;
}

export default function UniversityCard({
  id,
  image,
  name,
  city,
  programs,
  passingScore,
  onViewDetails,
}: UniversityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      <img
        src={image}
        alt={name}
        className="w-full h-[200px] object-cover"
      />
      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-primary_text mb-1">{name}</h3>
        <p className="text-secondary_text text-sm mb-3">{city}</p>
        
        {/* Programs */}
        <p className="text-secondary_text text-sm mb-2">
          {programs.join(" • ")}
        </p>
        
        {/* Passing score */}
        <p className="text-secondary_text text-sm mb-4">
          Passing score: <span className="font-semibold">{passingScore}</span>
        </p>
        
        {/* Button */}
        <button
          onClick={() => onViewDetails(id)}
          className="w-full py-2 text-primary font-semibold text-center border border-primary rounded-md hover:bg-primary hover:text-white transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
