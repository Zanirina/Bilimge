import heroImg from "../assets/hero.jpg";
import why_matters from "../assets/why-matters.jpg";
import { Card } from "../shared/ui/Card";
import CallToActionSection from "../shared/ui/CallToActionSection";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-[600px] flex items-center justify-center py-16 mx-30">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left: Text */}
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold text-[#111928] leading-tight mb-[35px]">
              Prepare Smarter.<br />
              Choose Better.<br />
              Enter Your University.
            </h1>
            <p className="text-lg text-[#4B5563] mb-[30px] max-w-xl">
              Explore universities in Kazakhstan, prepare for entrance exams, and receive personalized recommendations powered by artificial intelligence to help you choose the right academic path.
            </p>
            <div className="flex gap-6">
              <button className="bg-[#3356AA] text-white font-medium px-8 py-3 rounded-md text-lg hover:bg-[#27315f] transition">
                Get Started
              </button>
              <button className="bg-white text-[#111928] font-medium px-8 py-3 rounded-md text-lg border border-[#3a4d8f] hover:bg-[#111928] transition">
                Learn More
              </button>
            </div>
          </div>
          {/* Right: Image with dotted shape */}
          <div className="flex-1 flex justify-center relative min-w-[340px]">
            {/* Dotted SVG shape */}
            <div className="absolute left-[0px] bottom-[-64px] z-0 hidden md:block">
              <svg width="120" height="120" className="text-[#3a4d8f]" fill="none">
                {Array.from({ length: 5 }).map((_, row) => (
                  Array.from({ length: 5 }).map((_, col) => (
                    <circle
                      key={row + '-' + col}
                      cx={col * 20 + 8}
                      cy={row * 20 + 8}
                      r="3"
                      fill="currentColor"
                    />
                  ))
                ))}
              </svg>
            </div>
            <div className="rounded-tl-[80px] overflow-hidden shadow-xl relative z-10">
              <img
                src={heroImg}
                alt="Student studying"
                className="w-[490px] h-[515px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-30 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="text-[#3356AA] font-semibold mb-2 text-lg">Our Features</div>
          <h2 className="text-4xl md:text-4xl font-extrabold text-[#111928] mb-4">How the Platform Works</h2>
          <p className="text-[#4B5563] text-md max-w-2xl mx-auto">
            Make smarter decisions about your future with powerful, easy-to-use tools designed to guide you toward success at every step of your academic journey.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-center gap-12 relative">
          {/* Dotted line */}
          <div className="hidden md:block absolute left-80 right-80 top-7 z-0">
            <svg width="100%" height="24" className="w-full h-6">
              <line x1="10" y1="12" x2="98%" y2="12" stroke="#3356AA" strokeWidth="3" strokeDasharray="8,8" />
            </svg>
          </div>

          {/* Feature 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="bg-[#3356AA] rounded-lg p-5 mb-[30px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#111928]">Explore Universities</h3>
            <p className="text-[#4B5563] max-w-xs text-center">Search and compare universities and ask the AI Assistant for guidance.</p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="bg-[#3356AA] rounded-lg p-5 mb-[30px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#111928]">Plan Your Admission</h3>
            <p className="text-[#4B5563] max-w-xs text-center">Track deadlines and estimate your admission chances with the Chance Calculator.</p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="bg-[#3356AA] rounded-lg p-5 mb-[30px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#111928]">Prepare for Exams</h3>
            <p className="text-[#4B5563] max-w-xs text-center">Use preparation tools and AI recommendations to improve your results.</p>
          </div>
        </div>
      </section>

      <section
        className="relative w-full min-h-[720px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${why_matters})` }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 max-w-[600px] right-75 bg-white rounded shadow-xl p-10 m-8">
          <h2 className="text-4xl md:text-4xl font-bold text-[#111928] mb-6">
            Why This Platform Matters
          </h2>
          <p className="text-[#4B5563] text-md mb-8">
            Applicants often struggle to find reliable information about universities, admission requirements, and important deadlines. Our platform simplifies this process by collecting verified data from official sources and providing tools that help students plan their admission journey with confidence.
          </p>
          <button className="px-8 py-3 border-1 border-[#111928] text-md font-semibold hover:bg-[#f5f7fa] transition">
            Start Now
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#f5f7fa]">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <div className="text-[#3356AA] font-semibold mb-2 text-lg">Our Services</div>
          <h2 className="text-4xl md:text-4xl font-extrabold text-[#111928] mb-4">Tools to Support Your Admission Journey</h2>
          <p className="text-[#4B5563] text-lg max-w-2xl mx-auto">
            Everything you need to navigate your admission journey with confidence, clarity, and the right support at every step.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>}
            title="Program Comparison"
            description="Quickly find universities across Kazakhstan. Compare universities and programs side-by-side."
          />
          <Card
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            }
            title="AI Assistant"
            description="Ask questions and receive guidance about universities, programs, and admission requirements."
          />
          <Card
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
              </svg>
            }
            title="Chance Calculator"
            description="Estimate your chances of admission based on exam scores and selected programs."
          />
          <Card
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            }
            title="Admission Calendar"
            description="Create a personalized calendar and track admission deadlines and important testing dates in one place."
          />
          <Card
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            }
            title="Exam Preparation Courses"
            description="Access structured preparation courses and learning materials designed to help applicants."
          />
          <Card
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white w-9 h-9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
            }
            title="Official Admission Updates"
            description="Receive the latest updates from the National Testing Center (NTC) and official university sources."
          />
        </div>
      </section>

      <CallToActionSection />
    </div>
  );
}