import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DatePickerWithValidation = ({ venueId, value, onChange }) => {
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    if (venueId) {
      fetchBookedDates();
    }
  }, [venueId]);

  const fetchBookedDates = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/bookings/getbookeddates',
        { venueId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Booked dates response:', response.data);
      setBookedDates(response.data || []);
    } catch (err) {
      console.error('Error fetching booked dates:', err);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isBooked = (date) => {
    const formatted = formatDate(date); // strictly local formatted date
    return bookedDates.some(b => b.date === formatted);
  };

  const handleDateChange = (selectedDate) => {
    if (!selectedDate) return;

    const today = new Date();
    if (
      isPastDate(selectedDate) ||
      selectedDate.toDateString() === today.toDateString()
    ) {
      toast.error("You cannot select past or today's date.");
      return;
    }

    if (isBooked(selectedDate)) {
      toast.error("This date is fully booked.");
      return;
    }

    onChange(formatDate(selectedDate));
  };

  const getDayClassName = (date) => {
    const formatted = formatDate(date);
    const isBookedDate = bookedDates.some(b => b.date === formatted);

    if (isPastDate(date)) return 'gray-date';
    if (isBookedDate) return 'red-date';
    return '';
  };

  return (
    <div className="w-full">
      <DatePicker
        className="w-full border border-gray-300 rounded-md p-2"
        selected={value ? new Date(value) : null}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
        placeholderText="Select a date"
        dayClassName={getDayClassName}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <style>{`
        .red-date {
          background-color: #ffcccc !important;
          color: #a70000 !important;
          font-weight: bold;
          border-radius: 50% !important;
        }

        .gray-date {
          background-color: #f0f0f0 !important;
          color: #999 !important;
          border-radius: 50% !important;
        }
      `}</style>
    </div>
  );
};

export default DatePickerWithValidation;
