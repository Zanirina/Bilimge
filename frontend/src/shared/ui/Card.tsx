import type React from "react";

export interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode | string;
}

export function Card({ icon, title, description }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-start min-h-[220px] transition hover:shadow-lg">
      <div className="bg-[#3356AA] rounded-lg p-3 mb-5 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-[20px] font-bold text-[#111928] mb-2">{title}</h3>
      <p className="text-[#4B5563] text-base">{description}</p>
    </div>
  );
}
