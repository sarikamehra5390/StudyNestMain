import Navbar from './Navbar';
import Particles from './Particles';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen relative text-text overflow-x-hidden">
      <Particles />
      {/* Glowing Haze */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <Navbar />
      
      <main className="relative z-10 pt-28 px-6 md:px-12 max-w-7xl mx-auto pb-12 min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
