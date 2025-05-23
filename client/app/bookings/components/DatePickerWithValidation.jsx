import React, { useState, useEffect } from 'react';
import { NepaliDatePicker } from 'nepali-datepicker-reactjs';
import 'nepali-datepicker-reactjs/dist/index.css';
import axios from 'axios';

const DatePickerWithValidation = ({ value, onChange, eventTime }) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookedDates();
  }, []);

  const fetchBookedDates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings');
      const bookings = response.data.bookings || [];
      const approvedBookings = bookings.filter(booking => booking.status === 'approved');
      setBookedDates(approvedBookings);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const isDateBooked = (selectedDate) => {
    const dateStr = selectedDate.toString();
    return bookedDates.some(booking => {
      const bookingDate = new Date(booking.date).toISOString().split('T')[0];
      return bookingDate === dateStr && booking.eventTime === eventTime;
    });
  };

  const isPastDate = (selectedDate) => {
    // Convert Nepali date to English date
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    const today = new Date();
    
    // Reset time to start of day for both dates
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return selected < today;
  };

  const handleDateChange = (date) => {
    if (isPastDate(date)) {
      setError('Cannot select past dates');
      return;
    }

    if (isDateBooked(date)) {
      setError(`This ${eventTime} shift is already booked for the selected date`);
      return;
    }

    setError('');
    onChange(date);
  };

  const getCustomStyles = (date) => {
    if (isPastDate(date)) {
      return { 
        backgroundColor: '#ffebee', 
        color: '#c62828',
        cursor: 'not-allowed',
        opacity: '0.7',
        pointerEvents: 'none'
      };
    }
    if (isDateBooked(date)) {
      return { 
        backgroundColor: '#fff3e0', 
        color: '#ef6c00',
        cursor: 'not-allowed',
        opacity: '0.7',
        pointerEvents: 'none'
      };
    }
    return {};
  };

  return (
    <div className="w-full">
      <NepaliDatePicker
        inputClassName="w-full border border-gray-300 rounded-md p-2"
        value={value}
        onChange={handleDateChange}
        options={{
          calenderLocale: "ne",
          valueLocale: "en",
          dateFormat: "YYYY-MM-DD",
          customStyles: getCustomStyles,
          disableBeforeToday: true,
          readOnlyInput: true,
          disableDaysBefore: new Date().toISOString().split('T')[0],
          onDateSelect: (selectedDate) => {
            if (!isPastDate(selectedDate) && !isDateBooked(selectedDate)) {
              onChange(selectedDate);
            }
          },
          className: "nepali-datepicker-custom",
          style: {
            width: '100%',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            padding: '0.5rem'
          }
        }}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      <style jsx global>{`
        .nepali-datepicker-custom .calendar-container {
          background-color: white;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .nepali-datepicker-custom .calendar-container .calendar-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .nepali-datepicker-custom .calendar-container .calendar-body .calendar-row .calendar-cell.disabled,
        .nepali-datepicker-custom .calendar-container .calendar-body .calendar-row .calendar-cell.past-date {
          background-color: #ffebee !important;
          color: #c62828 !important;
          cursor: not-allowed !important;
          opacity: 0.7 !important;
          pointer-events: none !important;
        }
        .nepali-datepicker-custom .calendar-container .calendar-body .calendar-row .calendar-cell.booked {
          background-color: #fff3e0 !important;
          color: #ef6c00 !important;
          cursor: not-allowed !important;
          opacity: 0.7 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
};

export default DatePickerWithValidation; 