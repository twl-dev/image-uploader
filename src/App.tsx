import React, { useState } from 'react';
import { Settings, Upload as UploadIcon } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'gallery' | 'admin'>('upload');
  const [adminMode, setAdminMode] = useState(false);

  const toggleAdminMode = () => {
    const password = prompt('Enter admin password:');
    if (password === 'admin123') { // You should change this password
      setAdminMode(true);
      setCurrentView('admin');
    } else if (password !== null) {
      alert('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <UploadIcon className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">AI Art Showcase</h1>
              </div>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'upload' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setCurrentView('gallery')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'gallery' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={adminMode ? () => setCurrentView('admin') : toggleAdminMode}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'admin' 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Admin Panel"
              >
                <Settings className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Share Your AI Creations
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your AI-generated artwork to share with everyone. 
                Your creations will be displayed in our public gallery for inspiration and learning.
              </p>
            </div>
            <ImageUpload />
          </div>
        )}

        {currentView === 'gallery' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Community AI Art Gallery
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore amazing AI-generated artwork shared by our community. 
                Click on any image to view it in full size.
              </p>
            </div>
            <ImageGallery />
          </div>
        )}

        {currentView === 'admin' && adminMode && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Admin Dashboard
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Manage uploaded images, moderate content, and monitor the gallery.
              </p>
            </div>
            <ImageGallery isAdmin={true} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p className="mb-2">
              Images are automatically removed daily at 11:59 PM to ensure fresh content.
            </p>
            <p className="text-sm">
              Built for sharing and showcasing AI creativity • Upload responsibly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;