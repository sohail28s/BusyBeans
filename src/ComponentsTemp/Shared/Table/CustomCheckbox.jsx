// --- Local Sub-components ---
export const CustomCheckbox = ({ checked, onChange }) => (
    <div className="relative inline-flex items-center justify-center w-[18px] h-[18px] cursor-pointer" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={onChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
        <span className={`flex items-center justify-center w-full h-full border-[1.5px] rounded-[4px] transition-colors pointer-events-none ${checked ? 'bg-[#1f2937] border-[#1f2937]' : 'bg-white border-gray-300'}`}></span>
        <svg className={`absolute w-3 h-3 pointer-events-none transition-opacity duration-150 ${checked ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5L6 10.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);