import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-[#3a4d8f] text-white py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between gap-10">
                {/* Left: Logo and description */}
                <div className="flex-1 min-w-[290px]">
                    <div className="text-[32px] font-bold mb-6" >
                        <span className="text-white">bilim</span>
                        <span className="text-[#f15a29]">ge</span>
                    </div>
                    <p className="mb-6 max-w-xs text-sm leading-relaxed">
                        Helping applicants explore universities in Kazakhstan, prepare for entrance exams, and make informed admission decisions.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <svg className="text-themeColor-500 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        <span>+7 (777) 777-77-77</span>
                    </div>
                </div>

                {/* Center: Links */}
                <div className="flex flex-[2] justify-between">
                    <div>
                        <div className="text-[#f15a29] font-semibold mb-10 min-w-[150px]">PLATFORM</div>
                        <ul className="space-y-1 text-sm">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/universities">Universities</Link></li>
                            <li><Link to="/majors">Majors</Link></li>
                            <li><Link to="/chatbot">AI Assistant</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-[#f15a29] font-semibold mb-10 min-w-[150px]">RESOURCES</div>
                        <ul className="space-y-1 text-sm">
                            <li><Link to="/admission-guide">Admission Guide</Link></li>
                            <li><Link to="/preparation">Exam Preparation</Link></li>
                            <li><Link to="/updates">Official Updates</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-[#f15a29] font-semibold mb-10 min-w-[150px]">COMPANY</div>
                        <ul className="space-y-1 text-sm">
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contacts">Contacts</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Use</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Right: Socials */}
                <div className="w-[180px] flex flex-col items-start">
                    <div className="mb-10 text-white font-semibold">Follow Us On</div>
                    <div className="flex gap-3 mb-6">
                        <a href="#" className="bg-white rounded-full p-2">
                            <svg className="text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z"/> <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" /></svg>
                        </a>
                        <a href="#" className="bg-white rounded-full p-2">
                            <svg className="text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                        </a>
                        <a href="#" className="bg-white rounded-full p-2">
                            <svg className="text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /> <rect x="2" y="9" width="4" height="12" /> <circle cx="4" cy="4" r="2" /></svg>
                        </a>
                        <a href="#" className="bg-white rounded-full p-2">
                            <svg className="text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z"/> <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497 -3.753C20.18 7.773 21.692 5.25 22 4.009z" /></svg>
                        </a>
                    </div>
                    <div className="text-sm">© 2026 Bilimge.</div>
                </div>
            </div>
        </footer>
    );
}
