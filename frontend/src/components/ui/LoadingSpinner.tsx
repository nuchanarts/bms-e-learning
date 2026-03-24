export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };
  return (
    <div className="flex flex-col items-center gap-3">
      <svg className={`animate-spin ${sizes[size]}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#7B68EE" strokeWidth="4"/>
        <path className="opacity-75" fill="#7B68EE" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {size !== 'sm' && <p className="text-[#6B5FA0] text-sm font-medium">กำลังโหลด...</p>}
    </div>
  );
}
