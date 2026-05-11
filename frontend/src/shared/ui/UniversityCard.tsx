import { useNavigate } from "react-router-dom";

export interface UniversityCardProps {
  id: string;
  image: string | null;
  name: string;
  city: string;
  programs: string[];
  passingScore: string;
}

export default function UniversityCard({
  id,
  image,
  name,
  city,
  programs,
  passingScore,
}: UniversityCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      {image ? (
        <img src={image} alt={name} className="w-full h-[200px] object-cover" />
      ) : (
        <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image</span>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-primary_text mb-1">{name}</h3>
        <p className="text-secondary_text text-sm mb-3">{city}</p>

        {/* Programs */}
        {programs.length > 0 && (
          <p className="text-secondary_text text-sm mb-2">
            {programs.join(" • ")}
          </p>
        )}

        {/* Passing score */}
        <p className="text-secondary_text text-sm mb-4">
          Passing score: <span className="font-semibold">{passingScore}</span>
        </p>

        {/* Button */}
        <button
          onClick={() => navigate(`/universities/${id}`)}
          className="w-full py-2 text-primary font-semibold text-center border border-primary rounded-md"
        >
          View Details
        </button>
      </div>
    </div>
  );
}