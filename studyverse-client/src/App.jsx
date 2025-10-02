import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main style={{ padding: '0 30px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;