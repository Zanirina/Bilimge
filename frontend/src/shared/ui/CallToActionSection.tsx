import { useTranslation } from "react-i18next";

export default function CallToActionSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-[#f5f7fa] py-16 flex justify-center">
            <div className="relative w-full max-w-6xl rounded-lg overflow-hidden">
                {/* Blue background */}
                <div className="bg-[#3356AA] w-full h-full rounded-lg px-6 md:px-0 py-20 flex flex-col items-center justify-center relative">
                    {/* Top left decorative shape */}
                    <div className="absolute bottom-70 left-[-130px] rotate-45">
                        <svg width="250" height="250" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="0" width="250" height="250" rx="22" fill="#E95C4B" />
                        </svg>
                    </div>
                    {/* Bottom right decorative shape */}
                    <div className="absolute top-90 right-[-80px] rotate-135">
                        <svg width="250" height="250" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="0" width="250" height="250" rx="22" fill="#E95C4B" />
                        </svg>
                    </div>
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <div className="text-white text-lg mb-4">{t("home.calltoaction.subtitle")}</div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight whitespace-pre-line">
                            {t("home.calltoaction.title")}
                        </h2>
                        <p className="text-white text-md mb-8 max-w-2xl">
                            {t("home.calltoaction.description")}
                        </p>
                        <button className="bg-white text-[#3356AA] px-8 py-3 rounded-md text-md border-2 border-white hover:bg-[#f5f7fa] transition">
                            {t("home.calltoaction.button")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
