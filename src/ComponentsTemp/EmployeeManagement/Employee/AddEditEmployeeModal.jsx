import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthConfig } from '../../../utils/orderUtils';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en.json';
import Flags from 'react-phone-number-input/flags';
import { CustomCheckbox } from '../../Shared/Table/CustomCheckbox';

// Generate country list
const allCountries = getCountries().map(iso => ({
    iso,
    name: en[iso],
    code: `+${getCountryCallingCode(iso)}`,
    Flag: Flags[iso]
}));

const priorityCountryDefaults = { '+1': 'US', '+44': 'GB', '+61': 'AU' };

// --- Feature List ---
const FEATURE_LIST = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'invoice', label: 'Invoice' },
    { id: 'customer', label: 'Customer' },
    { id: 'selected-customer', label: 'Selected Customer' },
    { id: 'category', label: 'Category' },
    { id: 'employees', label: 'Employees' },
    { id: 'country', label: 'Country' },
    { id: 'charges', label: 'Charges' },
    { id: 'payment-pullout', label: 'Payment Pullout' },
    { id: 'report', label: 'Report' },
    { id: 'leads-dashboard', label: 'Leads Dashboard' },
    { id: 'quickbooks', label: 'Quickbooks' },
    { id: 'quickbooks-invoices', label: 'Quickbooks Invoices' }
];



export const AddEditEmployeeModal = ({ isOpen, onClose, onSuccess, employeeData }) => {
    const isEditMode = Boolean(employeeData);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        countryCode: '1'
    });

    // Edit mode password checkbox
    const [updatePassword, setUpdatePassword] = useState(false);

    // Phone Dropdown State
    const [isPhoneOpen, setIsPhoneOpen] = useState(false);
    const [selectedPhoneIso, setSelectedPhoneIso] = useState('US');
    const phoneDropdownRef = useRef(null);

    // Features State
    const [features, setFeatures] = useState(
        FEATURE_LIST.map(f => ({ feature: f.id, create: false, view: false, update: false, delete: false }))
    );
    const [selectAll, setSelectAll] = useState(false);

    // --- Phone Dropdown Click Outside Logic ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target)) setIsPhoneOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Data Fetching for Edit Mode ---
    useEffect(() => {
        if (!isOpen) return;

        if (isEditMode) {
            const fetchEmployeeDetails = async () => {
                setIsLoading(true);
                try {
                    const res = await axios.get(`https://testingbb.trimworldwide.com/api/v1/admin/employee/${employeeData.id}`, getAuthConfig());
                    if (res.data?.status === 'success') {
                        const data = res.data.data;

                        setFormData({
                            name: data.name || '',
                            email: data.email || '',
                            password: '', // Blank by default on edit
                            phoneNumber: data.phoneNumber || '',
                            countryCode: data.countryCode || '1'
                        });

                        // Set correct Flag ISO based on fetched country code
                        const codeWithPlus = data.countryCode ? `+${data.countryCode}` : '+1';
                        const iso = priorityCountryDefaults[codeWithPlus] || allCountries.find(c => c.code === codeWithPlus)?.iso || 'US';
                        setSelectedPhoneIso(iso);

                        // Map fetched features to state matrix
                        if (data.features && Array.isArray(data.features)) {
                            setFeatures(prev => prev.map(f => {
                                const found = data.features.find(apiF => apiF.feature === f.feature);
                                return found ? { ...f, ...found } : f;
                            }));
                        }
                    }
                } catch (error) {
                    toast.error("Failed to load employee details.");
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            };
            fetchEmployeeDetails();
            setUpdatePassword(false);
            setShowPassword(false);
        } else {
            // Reset form for Add mode
            setFormData({ name: '', email: '', password: '', phoneNumber: '', countryCode: '1' });
            setSelectedPhoneIso('US');
            setFeatures(FEATURE_LIST.map(f => ({ feature: f.id, create: false, view: false, update: false, delete: false })));
            setSelectAll(false);
            setUpdatePassword(false);
            setShowPassword(false);
        }
    }, [isOpen, isEditMode, employeeData, onClose]);

    // Derived active phone flag data
    const activePhoneCountry = allCountries.find(c => c.iso === selectedPhoneIso) || allCountries[0];
    const ActiveFlag = activePhoneCountry?.Flag;

    // --- Permissions Logic ---
    const handlePermissionChange = (featureId, permissionType, isChecked) => {
        setFeatures(prev => {
            return prev.map(f => {
                if (f.feature === featureId) return { ...f, [permissionType]: isChecked };

                // MUTUAL EXCLUSIVITY: Customer vs Selected Customer
                if (featureId === 'customer' && isChecked && f.feature === 'selected-customer') {
                    return { ...f, create: false, view: false, update: false, delete: false };
                }
                if (featureId === 'selected-customer' && isChecked && f.feature === 'customer') {
                    return { ...f, create: false, view: false, update: false, delete: false };
                }

                return f;
            });
        });
        if (!isChecked) setSelectAll(false);
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);

        setFeatures(prev => prev.map(f => {
            // Priority to general 'customer', uncheck 'selected-customer'
            if (isChecked && f.feature === 'selected-customer') {
                return { ...f, create: false, view: false, update: false, delete: false };
            }
            return { ...f, create: isChecked, view: isChecked, update: isChecked, delete: isChecked };
        }));
    };

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode && updatePassword && !formData.password) {
            return toast.error("Please enter a new password or uncheck 'Update Password'.");
        }

        setIsSubmitting(true);
        const loadingId = toast.loading(isEditMode ? "Updating employee..." : "Adding employee...");

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                countryCode: formData.countryCode,
                features: features
            };

            if (!isEditMode) {
                payload.password = formData.password;
            } else if (updatePassword) {
                payload.password = formData.password;
            }

            let res;
            if (isEditMode) {
                res = await axios.patch(`https://testingbb.trimworldwide.com/api/v1/admin/employee/${employeeData.id}`, payload, getAuthConfig());
            } else {
                res = await axios.post('https://testingbb.trimworldwide.com/api/v1/admin/employee', payload, getAuthConfig());
            }

            if (res.status === 200 || res.status === 201 || res.data?.status === 'success') {
                toast.update(loadingId, { render: `Employee ${isEditMode ? 'updated' : 'added'} successfully!`, type: "success", isLoading: false, autoClose: 2000 });
                onSuccess();
                onClose();
            } else {
                throw new Error("API call failed");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.update(loadingId, { render: error.response?.data?.message || "Failed to save employee.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 py-8">
            <div className="bg-white w-full max-w-[550px] max-h-full rounded-[8px] shadow-xl flex flex-col font-sans relative animate-scaleIn overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
                    <h2 className="text-[18px] font-semibold text-[#374151]">
                        {isEditMode ? 'Edit Employee' : 'Add Employee'}
                    </h2>
                    <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 p-10 flex justify-center items-center text-gray-500 italic">
                        Loading employee data...
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <form id="employeeForm" onSubmit={handleSubmit} className="flex flex-col gap-6">

                            {/* --- Basic Information --- */}
                            <div>
                                <h3 className="text-[14px] font-medium text-[#4b5563] mb-4">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] text-[#6b7280] mb-1.5">Name</label>
                                        <input required type="text" placeholder="Enter Employee name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full h-[40px] px-3 bg-white text-gray-900 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#8C6D4F] text-[14px] placeholder:text-gray-400" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-[#6b7280] mb-1.5">Email</label>
                                        <input required type="email" placeholder="Enter Email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full h-[40px] px-3 bg-white text-gray-900 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#8C6D4F] text-[14px] placeholder:text-gray-400" />
                                    </div>

                                    {/* Password field logic */}
                                    <div className="col-span-2">
                                        {isEditMode && (
                                            <div className="flex justify-between items-center mb-1.5">
                                                <label className="text-[13px] text-[#6b7280]">Password</label>
                                                <label className="flex items-center gap-2 text-[12px] text-gray-600 cursor-pointer">
                                                    <input type="checkbox" checked={updatePassword} onChange={(e) => setUpdatePassword(e.target.checked)} className="rounded border-gray-300 text-[#8C6D4F] focus:ring-[#8C6D4F] cursor-pointer w-3.5 h-3.5" />
                                                    Update Password
                                                </label>
                                            </div>
                                        )}
                                        {(!isEditMode && (
                                            <label className="block text-[13px] text-[#6b7280] mb-1.5">Password</label>
                                        ))}

                                        {/* Hide entirely if in edit mode and checkbox is not checked */}
                                        {(!isEditMode || updatePassword) && (
                                            <div className="relative">
                                                <input required={!isEditMode || updatePassword} type={showPassword ? 'text' : 'password'} placeholder="Enter Password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} className="w-full h-[40px] px-3 bg-white text-gray-900 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#8C6D4F] text-[14px] placeholder:text-gray-400" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone & Country Code */}
                                    <div className="col-span-2">
                                        <label className="block text-[13px] text-[#6b7280] mb-1.5">Phone Number</label>
                                        <div className="flex gap-3">
                                            {/* Custom Phone Dropdown */}
                                            <div className="relative" ref={phoneDropdownRef}>
                                                <div
                                                    onClick={() => setIsPhoneOpen(!isPhoneOpen)}
                                                    className="w-[110px] h-[40px] px-2 border border-[#d1d5db] bg-white rounded-[6px] flex items-center justify-between cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {ActiveFlag && <ActiveFlag className="w-5 h-4 object-cover border border-gray-100" />}
                                                        <span className="text-[14px] text-gray-900">{activePhoneCountry?.code}</span>
                                                    </div>
                                                    <svg className={`w-3 h-3 text-gray-500 transition-transform ${isPhoneOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </div>

                                                {isPhoneOpen && (
                                                    <div className="absolute top-[calc(100%+4px)] left-0 w-[280px] bg-white border border-gray-200 rounded-[6px] shadow-lg z-[9999] py-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                        {allCountries.map(c => {
                                                            const FlagComp = c.Flag;
                                                            return (
                                                                <div
                                                                    key={c.iso}
                                                                    onClick={() => {
                                                                        setSelectedPhoneIso(c.iso);
                                                                        setFormData(p => ({ ...p, countryCode: c.code.replace('+', '') }));
                                                                        setIsPhoneOpen(false);
                                                                    }}
                                                                    className={`px-3 py-2 text-[14px] cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${selectedPhoneIso === c.iso ? 'bg-blue-50' : ''}`}
                                                                >
                                                                    {FlagComp && <FlagComp className="w-5 h-4 object-cover border border-gray-100 shrink-0" />}
                                                                    <span className="text-gray-900 w-[40px]">{c.code}</span>
                                                                    <span className="text-gray-600 truncate">{c.name}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                required
                                                type="number"
                                                placeholder="Phone number"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                                                className="flex-1 h-[40px] px-3 bg-white text-gray-900 border border-[#d1d5db] rounded-[6px] outline-none focus:border-[#8C6D4F] text-[14px] placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- Permissions Grid --- */}
                            <div>
                                <h3 className="text-[14px] font-medium text-[#4b5563] mb-1">Permissions</h3>
                                <p className="text-[12px] text-gray-500 mb-3">Choose one of Customer or Selected customer only.</p>

                                <div className="border border-gray-200 rounded-[8px] overflow-hidden">
                                    <table className="w-full text-left bg-white">
                                        <thead className="bg-[#f9fafb] border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-[12px] font-semibold text-gray-600">Feature</th>
                                                <th className="px-2 py-3 text-[12px] font-semibold text-gray-600 text-center">Create</th>
                                                <th className="px-2 py-3 text-[12px] font-semibold text-gray-600 text-center">View</th>
                                                <th className="px-2 py-3 text-[12px] font-semibold text-gray-600 text-center">Update</th>
                                                <th className="px-2 py-3 text-[12px] font-semibold text-gray-600 text-center">Delete</th>
                                            </tr>
                                        </thead>
                                        {/* <tbody className="divide-y divide-gray-100">
                                            {features.map((row) => (
                                                <tr key={row.feature} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-[13px] text-gray-700 capitalize">
                                                        {FEATURE_LIST.find(f => f.id === row.feature)?.label}
                                                    </td>
                                                    {['create', 'view', 'update', 'delete'].map(perm => (
                                                        <td key={perm} className="px-2 py-2 text-center">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={row[perm]}
                                                                onChange={(e) => handlePermissionChange(row.feature, perm, e.target.checked)}
                                                                className="w-[15px] h-[15px] rounded border-gray-300 text-gray-700 focus:ring-gray-700 cursor-pointer"
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody> */}


                                        <tbody className="divide-y divide-gray-100">
                                            {features.map((row) => (
                                                <tr key={row.feature} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-[13px] text-gray-700 capitalize">
                                                        {FEATURE_LIST.find(f => f.id === row.feature)?.label}
                                                    </td>
                                                    {['create', 'view', 'update', 'delete'].map(perm => (
                                                        <td key={perm} className="px-2 py-2">
                                                            <div className="flex justify-center items-center w-full h-full">
                                                                <CustomCheckbox
                                                                    checked={row[perm]}
                                                                    onChange={(e) => handlePermissionChange(row.feature, perm, e.target.checked)}
                                                                />
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="bg-[#f9fafb] border-t border-gray-200 px-4 py-3 flex justify-end">
                                        <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 cursor-pointer">
                                            <CustomCheckbox
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                            Select All
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting || isLoading}
                        className="h-[40px] px-6 text-gray-600 font-medium border border-gray-300 rounded-[6px] hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="employeeForm"
                        disabled={isSubmitting || isLoading}
                        className="h-[40px] px-8 bg-[#86644c] text-white font-medium rounded-[6px] hover:bg-[#73543d] transition-colors shadow-sm flex items-center justify-center min-w-[140px]"
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            isEditMode ? "Save Changes" : "Add Employee"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};