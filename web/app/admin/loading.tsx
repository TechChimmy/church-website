export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      {/* Premium glowing spinner */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-[3px] border-stone-100" />
        <div 
          className="absolute inset-0 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: "var(--burgundy) transparent transparent transparent" }}
        />
      </div>
      
      {/* Subtext */}
      <p className="font-lato text-[11px] font-bold uppercase tracking-widest text-stone-400 animate-pulse">
        Loading Admin CMS...
      </p>
    </div>
  );
}
