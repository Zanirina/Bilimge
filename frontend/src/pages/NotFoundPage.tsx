export default function Error404Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-[160px] md:text-[220px] font-bold text-black leading-none tracking-tighter">
          404
        </h1>

        {/* Main Message */}
        <p className="text-2xl md:text-3xl font-medium text-black mt-2">
          Oops! That page can’t be found
        </p>

        {/* Sub Message */}
        <p className="text-gray-600 mt-3 text-lg">
          The page you are looking for it maybe deleted
        </p>

        {/* Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="mt-10 px-8 py-3 border-2 border-black text-black rounded-xl font-medium hover:bg-black hover:text-white transition-all duration-200"
        >
          Go To Home
        </button>
      </div>
    </div>
  );
}