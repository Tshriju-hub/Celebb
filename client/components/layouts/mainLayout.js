import NavBar from "../navBar";
import Footer from "../footer";

const MainLayout = ({ children }) => {
  return (
    <>
      <section className="flex h-screen flex-col">
        <NavBar />
        <main className="flex flex-1 flex-col justify-center">
          {children}
        </main>
        <Footer />
      </section>
    </>
  );
};

export default MainLayout;
