// src/App.tsx
import { useState } from 'react';
import GiftPage from './GiftPage';     // Import component quà
import MainApp from './components/MainApp'; // Import component app 3D chính
import './index.css'; // Import CSS toàn cục

function App() {
  // true = đang hiển thị quà
  // false = hiển thị app 3D
  const [showGift, setShowGift] = useState(true);

  // Hàm này sẽ được gọi từ GiftPage khi nó chạy xong
  const handleGiftComplete = () => {
    setShowGift(false); // Chuyển state sang false để ẩn quà
  };

  return (
    <>
      {/* Nếu showGift là true, render <GiftPage>
        Nếu không, render <MainApp>
      */}
      {showGift ? (
        <GiftPage onComplete={handleGiftComplete} />
      ) : (
        <MainApp />
      )}
    </>
  );
}

export default App;