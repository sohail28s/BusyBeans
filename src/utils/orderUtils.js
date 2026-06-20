export const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
});
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};
export const formatDateWithTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};
export const formatMoney = (val) => isNaN(parseFloat(val)) ? '$0.00' : `$${parseFloat(val).toFixed(2)}`;
