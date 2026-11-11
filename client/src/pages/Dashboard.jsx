import { useState, useEffect, useCallback } from 'react';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import WorkspaceView from './WorkspaceView';
import { ToastContainer } from '../components/Toast';

const Dashboard = () => {
  const { socket, isConnected } = useSocket();
  const [toasts, setToasts] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Listen for new announcements to show toast
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewAnnouncement = (announcement) => {
      addToast(`New announcement: ${announcement.title}`, 'info');
    };

    socket.on('newAnnouncement', handleNewAnnouncement);

    return () => {
      socket.off('newAnnouncement', handleNewAnnouncement);
    };
  }, [socket, isConnected, addToast]);

  return (
    <WorkspaceProvider>
      <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
        <Navbar
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
          <WorkspaceView onOpenSidebar={() => setMobileSidebarOpen(true)} />
        </div>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </WorkspaceProvider>
  );
};

export default Dashboard;
