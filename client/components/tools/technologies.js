"use client";
import { useEffect, useRef, useState } from "react";
import {
  FaWordpress,
  FaLaravel,
  FaCss3,
  FaJs,
  FaHtml5,
  FaDatabase,
  FaPhp,
  FaPython,
  FaJava,
  FaReact,
  FaVuejs,
  FaLeaf,
  FaNodeJs,
} from "react-icons/fa";

const icons = [
  { icon: <FaHtml5 className="text-orange-500 text-4xl" /> },
  { icon: <FaCss3 className="text-indigo-500 text-4xl" /> },
  { icon: <FaPhp className="text-indigo-500 text-4xl" /> },
  { icon: <FaLaravel className="text-red-500 text-4xl" /> },
  { icon: <FaJs className="text-yellow-500 text-4xl" /> },
  { icon: <FaReact className="text-blue-500 text-4xl" /> },
  { icon: <FaVuejs className="text-green-600 text-4xl" /> },
  { icon: <FaNodeJs className="text-green-600 text-4xl" /> },
  { icon: <FaPython className="text-indigo-500 text-4xl" /> },
  { icon: <FaJava className="text-indigo-500 text-4xl" /> },
  { icon: <FaWordpress className="text-indigo-500 text-4xl" /> },
  { icon: <FaDatabase className="text-green-600 text-4xl" /> },
  { icon: <FaLeaf className="text-green-600 text-4xl" /> },
];

const Tools = () => {
  const [iconIndex, setIconIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prevIndex) =>
        prevIndex === icons.length - 1 ? 0 : prevIndex + 1
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const firstRowIcons = icons.slice(0, Math.ceil(icons.length / 2));
  const secondRowIcons = icons.slice(Math.ceil(icons.length / 2));

  return (
    <>
      <style>
        {`
       .hidden-content {
  opacity: 0;
  transform: translateX(10%);
}

.head-text {
  animation: slideDown 2s ease-out;
}

.text-animation {
  animation: slideUp 2s ease-out;
}

@keyframes slideDown {
  0% {
    transform: translateY(-50%);
    opacity: 0;
  }
  50% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(50%);
    opacity: 0;
  }
  50% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideRight {
  0% {
    transform: translateX(10%);
    opacity: 0;
  }
  10% {
    transform: translateX(0);
    opacity: 1;
  }
}

        `}
      </style>
      <div
        ref={sectionRef}
        className="flex flex-col md:flex-row p-4 md:p-8 mb-12 overflow-hidden bg-gray-50"
      >
        <div className="w-full md:w-1/3 md:text-left mb-4">
          <div className="flex flex-col">
            <h1
              className={`text-3xl font-light ml-6 md:ml-10 font-[Amarnath] text-[#1D347D] uppercase ${
                isVisible ? "head-text" : "hidden-content"
              }`}
            >
              Tools & Technologies
            </h1>
            <h2
              className={`text-3xl font-light ml-6 md:ml-10 font-[Amarnath] text-[#1D347D] uppercase ${
                isVisible ? "head-text" : "hidden-content"
              }`}
            >
              That We Use
            </h2>
          </div>
          <div className="border-t border-black w-10/12 md:w-7/12 mx-auto md:mx-10 mt-2"></div>
          <p
            className={`text-lg font-[Inter] text-green-600 w-10/12 mx-auto md:w-7/12 mt-2 md:ml-10 ${
              isVisible ? "text-animation" : "hidden-content"
            }`}
          >
            AlphaWave employs high-quality technological tools like HTML, CSS,
            PHP, Laravel, MySQL, React, MongoDB, Node.js, JavaScript, Vue.js,
            Next.js, and others.
          </p>
        </div>
        <div className="w-full md:w-1/2">
          <div
            className={`flex flex-wrap justify-center gap-5 ${
              isVisible ? "head-text" : "hidden-content"
            }`}
          >
            {firstRowIcons.map((item, index) => (
              <div
                key={index}
                className={`${
                  index === iconIndex
                    ? "opacity-100 transform scale-110"
                    : "opacity-60"
                } transition-all duration-300 flex flex-col items-center space-y-2`}
              >
                <div className="border bg-white p-5 rounded-lg shadow-lg hover:shadow-xl hover:scale-125 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>
          <div
            className={`flex flex-wrap justify-center gap-5 mt-6 ${
              isVisible ? "text-animation" : "hidden-content"
            }`}
          >
            {secondRowIcons.map((item, index) => (
              <div
                key={index}
                className={`${
                  index + firstRowIcons.length === iconIndex
                    ? "opacity-100 transform scale-110"
                    : "opacity-60"
                } transition-all duration-300 flex flex-col items-center space-y-2`}
              >
                <div className="border mt-6 bg-white p-5 rounded-lg shadow-lg hover:shadow-xl hover:scale-125 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tools;
