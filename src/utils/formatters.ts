export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

export const getBookingStatusVariant = (status: string): string => {
  switch (status) {
    case 'Confirmed':
      return 'success';
    case 'Checked In':
      return 'primary';
    case 'Checked Out':
      return 'info';
    case 'Pending':
      return 'warning';
    case 'Cancelled':
      return 'danger';
    case 'No Show':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const getPaymentStatusVariant = (status: string): string => {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Partial':
      return 'warning';
    case 'Pending':
      return 'info';
    case 'Refunded':
      return 'secondary';
    case 'Failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const getRoomStatusVariant = (status: string): string => {
  switch (status) {
    case 'Available':
      return 'success';
    case 'Occupied':
      return 'danger';
    case 'Reserved':
      return 'warning';
    case 'Maintenance':
      return 'secondary';
    case 'Cleaning':
      return 'info';
    default:
      return 'secondary';
  }
};
