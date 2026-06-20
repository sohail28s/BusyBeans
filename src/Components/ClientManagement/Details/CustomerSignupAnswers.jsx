import React from 'react';

const CustomerSignupAnswers = ({ email }) => {
    return (
        <div className="w-full pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Signup Answers</h2>
            <div className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
                <div className="text-sm">
                    <div className="text-gray-700 font-medium">Email to send invoices</div>
                    <div className="text-gray-600 italic">{email || "—"}</div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSignupAnswers;