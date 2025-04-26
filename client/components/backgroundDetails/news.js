'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';

export default function NewsCarousel() {
  const [index, setIndex] = useState(0);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/news');
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? news.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev === news.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <div className="text-center py-10">Loading news...</div>;
  if (news.length === 0) return <div className="text-center py-10">No news available</div>;

  return (
    <div className="bg-[#f5efeb] py-10 px-5 text-center">
      <h2 className="text-xl font-semibold text-gray-800">
        Stay Informed, Stay Inspired: Latest News and Exclusive Offers for
      </h2>
      <h3 className="text-lg text-[#7a1313] font-bold">Your Perfect Celebration!</h3>
      <div className="relative flex items-center justify-center mt-6">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 z-10"
          onClick={prevSlide}
        >
          <ChevronLeft size={20} />
        </Button>

        <div className="flex gap-4 overflow-hidden w-full max-w-5xl justify-center">
          {news.map((item, i) => (
            <Card
              key={item._id}
              className={`w-[360px] flex-shrink-0 transition-transform duration-500 ease-in-out transform ${
                i === index ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
              }`}
            >
              <div className="w-full h-[220px] relative">
                <Image
                  src={item.image || '/Image/default-news.png'}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                <span className="text-xs text-gray-500 block mt-2">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 z-10"
          onClick={nextSlide}
        >
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
