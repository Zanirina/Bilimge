import { Link } from "react-router-dom";
import { TbPhoneCall } from "react-icons/tb";
import { FaFacebook, FaGithub, FaLinkedinIn, FaTwitter } from "react-icons/fa";

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
                        <TbPhoneCall className="text-themeColor-500 w-5 h-5" />
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
                        <FaFacebook className="text-white w-7 h-7" />
                        <FaGithub className="text-white w-7 h-7" />
                        <a href="#" className="bg-white rounded-full p-1.25">
                            <FaLinkedinIn className="text-[#3356AA] w-4.5 h-4.5" />
                        </a>
                        <a href="#" className="bg-white rounded-full p-1.25">
                            <FaTwitter className="text-[#3356AA] w-4.5 h-4.5" />
                        </a>
                    </div>
                    <div className="text-sm">© 2026 Bilimge.</div>
                </div>
            </div>
        </footer>
    );
}
