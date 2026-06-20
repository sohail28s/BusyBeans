import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiChevronDown } from 'react-icons/fi';
import useStore from '../../Hooks/useStore';
import { PageStatsHeader } from '../../ComponentsTemp/Shared/PageStatsHeader';
import { MachineModal } from '../../ComponentsTemp/MachineSubscriptions/MachineModal';
import { SubscribeModal } from '../../ComponentsTemp/MachineSubscriptions/SubscribeModal';
import { DeleteMachineModal } from '../../ComponentsTemp/MachineSubscriptions/DeleteMachineModal';
import { getAuthConfig } from '../../utils/orderUtils';

export const Subscribe = () => {
    // Top Navbar Zustand Hooks
    const setTitle = useStore((state) => state.setTitle);
    const setActions = useStore((state) => state.setActions);
    const setShowProfile = useStore((state) => state.setShowProfile);
    const setIsGlobalLoading = useStore(state => state.setIsGlobalLoading);

    const [machines, setMachines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('ALL');

    // Modal Trigger States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMachineId, setSelectedMachineId] = useState(null);

    // --- 1. Top Navbar Integration ---
    useEffect(() => {
        setTitle('Coffee Machine Membership');
        setActions(null);
        setShowProfile(false);

        return () => {
            setTitle('');
            setActions(null);
            setShowProfile(true);
        };
    }, [setTitle, setActions, setShowProfile]);

    // --- 2. Fetch Data with Axios ---
    const fetchMachines = async () => {
        setIsLoading(true);
        setIsGlobalLoading(true);
        try {
            const response = await axios.get('https://testingbb.trimworldwide.com/api/v1/admin/coffee-machine', getAuthConfig());
            if (response.data?.status === "success") {
                setMachines(response.data.data.data || []);
            } else {
                toast.error("Failed to fetch machines correctly.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "An error occurred while fetching data.");
        } finally {
            setIsLoading(false);
            setIsGlobalLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
    }, []);

    // --- 3. Filter Logic ---
    const filteredMachines = useMemo(() => {
        if (selectedFilter === 'ALL') return machines;
        return machines.filter(m => m.type?.toLowerCase() === selectedFilter.toLowerCase());
    }, [machines, selectedFilter]);

    const totalMachinesCount = machines.length;

    // --- 4. Modal Triggers ---
    const triggerAddModal = () => setIsAddModalOpen(true);

    const triggerEditModal = (id) => {
        setSelectedMachineId(id);
        setIsEditModalOpen(true);
    };

    const triggerSubscribeModal = (id) => {
        setSelectedMachineId(id);
        setIsSubscribeModalOpen(true);
    };

    const triggerDeleteModal = (id) => {
        setSelectedMachineId(id);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] bg-white font-sans pb-16">
            <div className="px-8 pt-8">

                {/* --- Top Action Row: Filter & Add Button Side-by-Side --- */}
                <div className="flex justify-end items-center gap-4 mb-6">
                    {/* Custom Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="h-[42px] w-[170px] pl-4 pr-11 appearance-none bg-white border border-[#e2e8f0] rounded-[6px] text-[15px] text-gray-700 font-medium focus:outline-none focus:border-[#86644c] cursor-pointer
    [&>option]:bg-white [&>option]:text-[16px] [&>option]:py-2
    [&>option:hover]:bg-blue-500
    "
                        >
                            <option value="ALL" className="py-2">All</option>
                            <option value="Commercial" className="py-2">Commercial</option>
                            <option value="Espresso" className="py-2">Espresso</option>
                        </select>

                        <div className="absolute right-0 top-0 h-full flex items-center pointer-events-none">
                            <span className="w-[1px] h-[22px] bg-gray-200 mx-2"></span>
                            <div className="flex items-center justify-center px-1 text-[#111827]">
                                <svg
                                    height="20" width="20" viewBox="0 0 20 20"
                                    aria-hidden="true" focusable="false" fill="currentColor"
                                    className={`transition-transform duration-200`}
                                >
                                    <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Add New Machine Button */}
                    <button
                        onClick={triggerAddModal}
                        className="h-[42px] px-6 bg-[#86644c] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#735541] transition-colors shadow-sm"
                    >
                        Add New Machine
                    </button>
                </div>

                {/* --- Stats Header --- */}
                <PageStatsHeader
                    cardTitle="Total Machines"
                    totalValue={totalMachinesCount}
                />
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-[#86644c]/30 border-t-[#86644c] rounded-full animate-spin"></div>
                    </div>
                )}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {filteredMachines.map(machine => (
                            <div
                                key={machine.id}
                                className="group relative flex flex-col bg-white border border-[#e5e7eb] rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div
                                    onClick={(e) => { e.stopPropagation(); triggerDeleteModal(machine.id); }}
                                    className="absolute top-3 right-3 w-8 h-8 bg-[#ef4444] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer shadow-sm hover:bg-[#dc2626]"
                                >
                                    <svg className="w-[16px] h-[16px] text-white" viewBox="0 0 24 24" fill="none">
                                        <path d="M 6 19 C 6 20.1 6.9 21 8 21 H 16 C 17.1 21 18 20.1 18 19 V 7 H 6 V 19 Z M 19 4 H 15.5 L 14.5 3 H 9.5 L 8.5 4 H 5 V 6 H 19 V 4 Z" fill="currentColor" />
                                    </svg>
                                </div>

                                {/* Image Area with warm gradient background */}
                                <div className="h-[180px] w-full flex items-center justify-center bg-gradient-to-br from-[#fef1d8] via-[#fef7e8] to-[#fff9f0] p-4">
                                    <img
                                        src={machine.image || "/Images/coffeemachine.png"}
                                        alt={machine.name}
                                        className="h-[148px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null; // prevent infinite loop
                                            e.target.src = "/Images/coffeemachine.png";
                                        }}
                                    />
                                </div>

                                {/* Content Area */}
                                <div className="flex flex-col flex-1 p-4">
                                    <div className="mb-2">
                                        <h3 className="text-[18px] font-bold text-gray-900 leading-tight capitalize truncate">
                                            {machine.name}
                                        </h3>
                                        <div className="inline-flex items-center h-[20px] px-2.5 mt-1 bg-[#86644C]/10 text-[#86644C] rounded-[6px] text-[12px] font-medium capitalize">
                                            {machine.type}
                                        </div>
                                    </div>

                                    <p className="text-[14px] text-[#4b5563] h-[20px] leading-[20px] overflow-hidden truncate mb-3">
                                        {machine.desc || 'No description provided'}
                                    </p>

                                    {/* Price & Capacity Row */}
                                    <div className="flex items-center justify-between mt-auto mb-4 pt-3 border-t border-gray-100">
                                        <div className="flex items-baseline">
                                            <span className="text-[20px] font-bold text-gray-900 leading-none">
                                                ${machine.price}
                                            </span>
                                            <span className="text-[14px] text-gray-500 font-normal ml-1">
                                                /{machine.pricePer}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-[6px] text-[#4b5563]">
                                            <svg className="w-[16px] h-[16px] fill-[#86644C]" viewBox="0 0 640 512">
                                                <path d="M 72 88 A 56 56 0 1 1 184 88 A 56 56 0 1 1 72 88 Z M 64 245.7 C 54 256.9 48 271.8 48 288 S 54 319.1 64 330.3 L 64 245.6 Z M 208.4 196.4 C 178.7 222.7 160 261.2 160 304 C 160 338.3 172 369.8 192 394.5 L 192 416 C 192 433.7 177.7 448 160 448 L 96 448 C 78.3 448 64 433.7 64 416 L 64 389.2 C 26.2 371.2 0 332.7 0 288 C 0 226.1 50.1 176 112 176 L 144 176 C 168 176 190.2 183.5 208.4 196.3 Z M 448 416 L 448 394.5 C 468 369.8 480 338.3 480 304 C 480 261.2 461.3 222.7 431.6 196.3 C 449.8 183.5 472 176 496 176 L 528 176 C 589.9 176 640 226.1 640 288 C 640 332.7 613.8 371.2 576 389.2 L 576 416 C 576 433.7 561.7 448 544 448 L 480 448 C 462.3 448 448 433.7 448 416 Z M 456 88 A 56 56 0 1 1 568 88 A 56 56 0 1 1 456 88 Z M 576 245.7 L 576 330.4 C 586 319.1 592 304.3 592 288.1 S 586 257 576 245.8 Z M 320 32 A 64 64 0 1 1 320 160 A 64 64 0 1 1 320 32 Z M 240 304 C 240 320.2 246 335 256 346.3 L 256 261.6 C 246 272.9 240 287.7 240 303.9 Z M 384 261.7 L 384 346.4 C 394 335.1 400 320.3 400 304.1 S 394 273 384 261.8 Z M 448 304 C 448 348.7 421.8 387.2 384 405.2 L 384 448 C 384 465.7 369.7 480 352 480 L 288 480 C 270.3 480 256 465.7 256 448 L 256 405.2 C 218.2 387.2 192 348.7 192 304 C 192 242.1 242.1 192 304 192 L 336 192 C 397.9 192 448 242.1 448 304 Z" />
                                            </svg>
                                            <span className="text-[14px] font-medium">{machine.uptoEmployees}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 h-[40px] w-full mt-auto">
                                        <button
                                            onClick={() => triggerEditModal(machine.id)}
                                            className="flex-1 h-full bg-[#111827] text-white text-[14px] font-medium rounded-[8px] hover:bg-gray-800 transition-colors shadow-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => triggerSubscribeModal(machine.id)}
                                            className="flex-1 h-full bg-[#86644C] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#735541] transition-colors shadow-sm"
                                        >
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <MachineModal
                    isOpen={isAddModalOpen || isEditModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setSelectedMachineId(null);
                    }}
                    // If in edit mode, find and pass the correct machine object, otherwise pass null for 'Add'
                    machine={isEditModalOpen ? machines.find(m => m.id === selectedMachineId) : null}
                    onSuccess={fetchMachines} // Re-fetches the grid data to update the UI instantly
                />
                <SubscribeModal
                    isOpen={isSubscribeModalOpen}
                    onClose={() => {
                        setIsSubscribeModalOpen(false);
                        setSelectedMachineId(null);
                    }}
                    machineId={selectedMachineId} // Pass the ID of the machine clicked
                />
                <DeleteMachineModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedMachineId(null);
                    }}
                    machineId={selectedMachineId}
                    onSuccess={fetchMachines}
                />

            </div>
        </div>
    );
};

export default Subscribe;