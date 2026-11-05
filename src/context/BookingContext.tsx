import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Room } from '../types';

export interface BookingDraft {
  room: Room | null;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  numberOfRooms: number;
  nights: number;
  roomPrice: number;
  subtotal: number;
  discount: number;
  taxes: number;
  totalAmount: number;
}

interface BookingContextType {
  draft: BookingDraft;
  setDraftRoom: (room: Room) => void;
  updateDraft: (updates: Partial<BookingDraft>) => void;
  clearDraft: () => void;
  calculatePricing: (room: Room, checkIn: string, checkOut: string, numberOfRooms?: number) => {
    nights: number;
    roomPrice: number;
    subtotal: number;
    discount: number;
    taxes: number;
    totalAmount: number;
  };
}

const getTodayString = () => new Date().toISOString().split('T')[0];
const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const initialDraft: BookingDraft = {
  room: null,
  checkIn: getTodayString(),
  checkOut: getTomorrowString(),
  adults: 2,
  children: 0,
  numberOfRooms: 1,
  nights: 1,
  roomPrice: 0,
  subtotal: 0,
  discount: 0,
  taxes: 0,
  totalAmount: 0
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);

  const calculatePricing = (
    room: Room,
    checkIn: string,
    checkOut: string,
    numberOfRooms: number = 1
  ) => {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = endDate.getTime() - startDate.getTime();
    const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Base price per night after discount %
    const discountRate = (room.discount || 0) / 100;
    const discountedPricePerNight = room.pricePerNight * (1 - discountRate);
    const subtotal = room.pricePerNight * calculatedNights * numberOfRooms;
    const totalDiscount = (room.pricePerNight * discountRate) * calculatedNights * numberOfRooms;
    const taxableAmount = subtotal - totalDiscount;
    const taxes = Number((taxableAmount * 0.10).toFixed(2)); // 10% standard hotel tax
    const totalAmount = Number((taxableAmount + taxes).toFixed(2));

    return {
      nights: calculatedNights,
      roomPrice: Number(discountedPricePerNight.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(totalDiscount.toFixed(2)),
      taxes: taxes,
      totalAmount: totalAmount
    };
  };

  const setDraftRoom = (room: Room) => {
    const pricing = calculatePricing(room, draft.checkIn, draft.checkOut, draft.numberOfRooms);
    setDraft(prev => ({
      ...prev,
      room,
      ...pricing
    }));
  };

  const updateDraft = (updates: Partial<BookingDraft>) => {
    setDraft(prev => {
      const merged = { ...prev, ...updates };
      if (merged.room) {
        const pricing = calculatePricing(
          merged.room,
          merged.checkIn,
          merged.checkOut,
          merged.numberOfRooms
        );
        return {
          ...merged,
          ...pricing
        };
      }
      return merged;
    });
  };

  const clearDraft = () => {
    setDraft(initialDraft);
  };

  return (
    <BookingContext.Provider
      value={{
        draft,
        setDraftRoom,
        updateDraft,
        clearDraft,
        calculatePricing
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
