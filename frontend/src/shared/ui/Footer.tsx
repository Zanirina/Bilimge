import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TbPhoneCall } from "react-icons/tb";
import { FaFacebook, FaGithub, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-[#3a4d8f] text-white py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between gap-12">
                {/* Left: Logo and description */}
                <div className="flex-1 min-w-[290px]">
                    <div className="text-[32px] font-bold mb-6" >
                        <span className="text-white">bilim</span>
                        <span className="text-[#f15a29]">ge</span>
                    </div>
                    <p className="mb-6 max-w-xs text-sm leading-relaxed">
                        {t("footer.description")}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <TbPhoneCall className="text-themeColor-500 w-5 h-5" />
                        <span>+7 (777) 777-77-77</span>
                    </div>
                </div>

                {/* Center: Links */}
                <div className="flex flex-[2] justify-between">
                    <div>
                        <div className="text-[#f15a29] font-semibold mb-10 min-w-[150px]">{t("footer.platform")}</div>
                        <ul className="space-y-1 text-sm">
                            <li><Link to="/">{t("nav.home")}</Link></li>
                            <li><Link to="/universities">{t("nav.universities")}</Link></li>
                            <li><Link to="/majors">{t("nav.majors")}</Link></li>
                            <li><Link to="/chatbot">{t("nav.aiAssistant")}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-[#f15a29] font-semibold mb-10 min-w-[150px]">{t("footer.resources")}</div>
                        <ul className="space-y-1 text-sm">
                            <li><Link to="/admission-guide">{t("nav.admissionGuide")}</Link></li>
                            <li><Link to="/preparation">{t("nav.examPreparation")}</Link></li>
                            <li><Link to="/updates">{t("nav.officialUpdates")}</Link></li>
                            <li><Link to="/faq">{t("nav.faq")}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-[#f15a29] font-semibold mb-10 min-w-[150px]">{t("footer.company")}</div>
                        <ul className="space-y-1 text-sm">
                            <li><Link to="/about">{t("nav.about")}</Link></li>
                            <li><Link to="/contacts">{t("nav.contacts")}</Link></li>
                            <li><Link to="/privacy">{t("nav.privacyPolicy")}</Link></li>
                            <li><Link to="/terms">{t("nav.termsOfUse")}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Right: Socials */}
                <div className="w-[180px] flex flex-col items-start">
                    <div className="mb-10 text-white font-semibold">{t("footer.followUs")}</div>
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
