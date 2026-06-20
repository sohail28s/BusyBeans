import { formatDate, formatDateWithTime, formatMoney } from '../../../utils/orderUtils';
export const ProgressTracker = ({ histories = [], currentStatus }) => {
    const steps = [
        { key: 1, label: 'Order Placed', matchKeys: ['Order Placed'] },
        { key: 2, label: 'Dispatched to Supplier', matchKeys: ['Dispatched to Supplier'] },
        { key: 3, label: 'Supplier Acknowledged', matchKeys: ['Acknowledged', 'Supplier Acknowledged'] },
        { key: 4, label: 'Shipped Orders', matchKeys: ['Shipped', 'Dispatched'] }
    ];

    // 1. Find the absolute maximum step based on the TRUE current status
    let currentStepKey = 0;
    const matchedCurrentStep = steps.find(step => step.matchKeys.includes(currentStatus));
    
    if (matchedCurrentStep) {
        currentStepKey = matchedCurrentStep.key;
    } else {
        // Fallback: If currentStatus is missing, fallback to the old history method
        steps.forEach(step => {
            if (histories.find(h => step.matchKeys.includes(h.orderStatus))) {
                currentStepKey = Math.max(currentStepKey, step.key);
            }
        });
    }

    return (
        <div className="relative flex justify-between w-full py-6 px-[1%]">
            <div className="absolute border-t-4 border-dashed border-gray-200 z-10" style={{ top: '39px', left: '5%', right: '5%' }} />
            
            {steps.map((step) => {
                const historyMatch = histories.find(h => step.matchKeys.includes(h.orderStatus));
                
                // CRITICAL FIX: Only mark as completed if the step's key is <= the TRUE current status key
                const isCompleted = step.key <= currentStepKey;
                
                // Only show the date if the step is ACTUALLY completed
                const dateStr = (isCompleted && historyMatch?.on) ? formatDateWithTime(historyMatch.on) : '';

                return (
                    <div key={step.key} className="flex flex-col items-center gap-y-2 relative z-20">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'bg-[#219653]' : 'bg-gray-300'}`}>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg" style={{ color: '#ffffff' }}>
                                <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
                            </svg>
                        </div>
                        <p className={`text-center text-[13px] md:text-[15px] font-medium ${isCompleted ? 'text-black' : 'text-gray-400'}`}>
                            {step.label}
                        </p>
                        <p className="text-black/40 text-[11px] md:text-[13px] text-center min-h-[18px]">
                            {dateStr}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};