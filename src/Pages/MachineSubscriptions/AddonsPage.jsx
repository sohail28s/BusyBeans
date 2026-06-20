import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader';
import { DeleteAddonModal } from '../../ComponentsTemp/MachineSubscriptions/Addons/DeleteAddonModel';
import { EditAddonModal } from '../../ComponentsTemp/MachineSubscriptions/Addons/EditAddonModal';
import { AddAddonsModal } from '../../ComponentsTemp/MachineSubscriptions/Addons/AddAddonsModal';
import { getAuthConfig } from '../../utils/orderUtils';
export const AddonsPage = () => {
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore((state) => state.setIsGlobalLoading);

    const [addons, setAddons] = useState([]);
    const [totalAddonsCount, setTotalAddonsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedAddonForEdit, setSelectedAddonForEdit] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addonToDelete, setAddonToDelete] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // --- Extracted fetch function using useCallback so it can be reused ---
    const fetchAddons = useCallback(async () => {
        setIsGlobalLoading(true);
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                'https://testingbb.trimworldwide.com/api/v1/subscription/addons',
                getAuthConfig()
            );
            if (response.data?.success) {
                setAddons(response.data.addons);
                setTotalAddonsCount(response.data.count);
            } else {
                throw new Error(response.data?.message || "Failed to fetch addons.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            const errMsg = err.response?.data?.message || err.message || "An error occurred while fetching addons.";
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    }, []);

    // Call fetch on initial load
    useEffect(() => {
        fetchAddons();
    }, [fetchAddons]);

    useEffect(() => {
        setTitle('Addons');
        setShowProfile(false);
        setActions(
            <button
                key="add-addon"
                onClick={() => setIsAddModalOpen(true)}
                className="h-[42px] px-6 text-[#111827] text-[15px] font-medium bg-transparent hover:bg-gray-50 transition-colors use the usesote for topnavbar to set stile ands etaction button here there are two buttons new producta nd export both will open the modal on click so addd a trigger now we will attach model later on second is the use pages stats header component to show the total of entries in tbale and on its rigt we ahve a dropdown for filteratonnfproducst based on cateeory underit there is admin and local partner switch by default its set to admin but if we clcik on the local partner it will open modal to slect the local partner and then slected aortner naem will be writtten in lace of word Local Partner in switch and on on right sideof this bar for admin it will be empty but if local partner slectedthen it will show two button , 1. add products , no 2 change price bothw ill triggerto open the modals under thiss ection there is acoloured box with wrtitten You are viewing Admin inventory. as default but if local aprtner sleted then You are viewing Hamza's inventory (Local Partner). Use Change Price  or Add Product to manage"
            >
                Add Addons
            </button>
        );
    }, [setTitle, setActions, setShowProfile]);

    const openEditModal = (addon) => {
        setModalMode('edit');
        setSelectedAddonForEdit(addon);
        setIsAddEditModalOpen(true);
    };

    const openDeleteModal = (addon) => {
        setAddonToDelete(addon);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="min-h-[calc(100vh-100px)] bg-white font-sans relative p-6">

            <div className="mb-10">
                <PageStatsHeader
                    cardTitle="Total Addons"
                    totalValue={totalAddonsCount}
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                                    SL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500 italic">
                                        Loading addons...
                                    </td>
                                </tr>
                            ) : addons.length > 0 ? (
                                addons.map((addon, index) => (
                                    <tr key={addon.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {addon.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                                            <p className="truncate">{addon.description || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${parseFloat(addon.price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                {/* Edit Button from Ref */}
                                                <button
                                                    onClick={() => openEditModal(addon)}
                                                    className="border border-theme text-theme p-2 rounded text-brand-brown transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path>
                                                    </svg>
                                                </button>
                                                {/* Delete Button from Ref */}
                                                <button
                                                    onClick={() => openDeleteModal(addon)}
                                                    className="border border-red-400 text-red-400 p-2 rounded hover:bg-red-400 hover:text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-left pl-10 py-6 text-gray-500 italic">
                                        No addons found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddAddonsModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchAddons}
            />
            <EditAddonModal
                isOpen={isAddEditModalOpen && modalMode === 'edit'}
                onClose={() => setIsAddEditModalOpen(false)}
                addonData={selectedAddonForEdit}
                onSuccess={fetchAddons}
            />

            <DeleteAddonModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                addonData={addonToDelete}
                // Pass fetchAddons so modal can refresh data on success
                onSuccess={fetchAddons}
            />

        </div>
    );
};

export default AddonsPage;