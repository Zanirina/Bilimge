export default function Loader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#F3F4F6]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#3356AA] border-t-transparent rounded-full animate-spin" />
        {message && <p className="text-sm text-gray-500">{message}</p>}
      </div>
    </div>
  );
}