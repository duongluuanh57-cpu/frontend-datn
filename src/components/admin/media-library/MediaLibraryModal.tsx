'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';

interface MediaItem {
  _id: string;
  url: string;
  displayUrl: string;
  originalBytes: number;
  compressedBytes: number;
  filename: string;
  createdAt: string;
}

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaLibraryModal({ open, onClose, onSelect }: MediaLibraryModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMedia = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const { data } = await api.get('/media', { params: { page: p, limit: 50 } });
      if (data.success) {
        setItems(data.data.items);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setPage(1);
      fetchMedia(1);
    }
  }, [open, fetchMedia]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-[#7A5C5C] uppercase tracking-wider">Thư viện ảnh</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#7A5C5C]" size={28} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ImageIcon size={48} className="mb-3 opacity-50" />
              <p className="text-sm">Chưa có ảnh nào trong thư viện.</p>
              <p className="text-xs mt-1">Upload ảnh qua admin để thấy chúng ở đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => { onSelect(item.url); onClose(); }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 hover:border-[#D4A5A5]/50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/50"
                >
                  <Image
                    src={item.url}
                    alt={item.filename || 'Media'}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[10px] text-white truncate block font-medium">
                      {item.filename || 'Ảnh'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-6 py-3 border-t border-gray-100 shrink-0">
            <button
              onClick={() => { const p = page - 1; setPage(p); fetchMedia(p); }}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} className="text-[#7A5C5C]" />
            </button>
            <span className="text-xs text-gray-500 font-medium">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => { const p = page + 1; setPage(p); fetchMedia(p); }}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} className="text-[#7A5C5C]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
