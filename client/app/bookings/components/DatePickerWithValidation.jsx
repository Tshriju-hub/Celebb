import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DatePickerWithValidation = ({ venueId, value, onChange, eventTime }) => {
  const [bookedDates, setBookedDates] = useState([]);
  useEffect(() => {
    fetchBookedDates();
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
      const bookings = response.data.bookings || [];
      const approvedBookings = bookings.filter(b => b.status === 'approved');
      setBookedDates(approvedBookings);
    } catch (err) {
      console.error('Error fetching booked dates:', err);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy < today;
  };

  const isBooked = (date) => {
    const dateCopy = new Date(date);
    const formatted = formatDate(dateCopy);
    return bookedDates.some(b => {
      const bookDate = new Date(b.date).toISOString().split('T')[0];
      return bookDate === formatted && b.eventTime === eventTime;
    });
  };

  const handleDateChange = (selectedDate) => {
    if (!selectedDate) return;

    if (isPastDate(selectedDate) || selectedDate.toDateString() === new Date().toDateString()) {
      toast.error("You cannot select past or today's date.");
      return;
    }

    if (isBooked(selectedDate)) {
      toast.error(`The ${eventTime} shift is already booked on this date.`);
      return;
    }

    onChange(formatDate(selectedDate));
  };

  const getDayClassName = (date) => {
    if (isPastDate(new Date(date)) || isBooked(new Date(date))) {
      return 'red-date';
    }
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
          background-color: #ffe6e6 !important;
          color: #d32f2f !important;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default DatePickerWithValidation;
