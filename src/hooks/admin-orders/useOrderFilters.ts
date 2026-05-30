'use client';

import { useState, useEffect, useMemo } from 'react';

export function useOrderFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page: currentPage, limit: ITEMS_PER_PAGE };
    if (searchTerm) params.search = searchTerm;
    if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
    if (selectedPaymentStatus && selectedPaymentStatus !== 'all') params.paymentStatus = selectedPaymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [currentPage, searchTerm, selectedStatus, selectedPaymentStatus, startDate, endDate]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedStatus, selectedPaymentStatus, startDate, endDate]);

  return {
    searchTerm, setSearchTerm,
    selectedStatus, setSelectedStatus,
    selectedPaymentStatus, setSelectedPaymentStatus,
    startDate, setStartDate,
    endDate, setEndDate,
    currentPage, setCurrentPage,
    ITEMS_PER_PAGE, queryParams,
  };
}