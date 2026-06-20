import { Link } from "react-router-dom";
export const InfoRow = ({ label, value, isLink, linkValue }) => (
    <div className="flex py-3 border-b border-gray-200 text-sm">
        <span className="w-1/3 text-black ">{label}</span>
        {isLink && value ? (
            <Link to={linkValue} className="text-[#3b82f6] hover:underline capitalize">{value}</Link>
        ) : (
            <span className={`text-gray-900 ${value === 'Not Assigned' ? 'text-gray-400 italic' : 'capitalize'}`}>
                {value || ''}
            </span>
        )}
    </div>
);


