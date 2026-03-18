/**
 * =============================================
 * FILE KHỞI ĐỘNG REACT (ENTRY POINT)
 * =============================================
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Đây là file đầu tiên React chạy
 * - Nó render (hiển thị) component App vào thẻ <div id="root"> trong index.html
 * - StrictMode giúp phát hiện lỗi trong quá trình phát triển
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Lấy thẻ <div id="root"> từ HTML làm điểm gắn kết
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render ứng dụng vào thẻ root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
