"use client";
import React, { useState, useEffect } from "react";
import MainLayout from "../components/layouts/mainLayout";
import Home from "@/components/backgroundDetails/home";
import About from "@/components/backgroundDetails/about";
import News from "@/components/backgroundDetails/news";
import Vendor from "@/components/backgroundDetails/vendor";
import Logo from "@/components/backgroundDetails/logo";
import Book from "@/components/backgroundDetails/book"
import LoadingScreen from "@/components/loading/loading";

const HomePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasLoadedBefore = localStorage.getItem("hasLoadedBefore");
    if (hasLoadedBefore) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
        localStorage.setItem("hasLoadedBefore", "true");
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <MainLayout>
      <Home />
      <About />
      <News />
      <Book/>
      <Logo/>
      <Vendor />
    </MainLayout>
  );
};

export default HomePage;
