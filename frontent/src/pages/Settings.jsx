import React, { useEffect, useState } from 'react';

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", 
  "garden", "forest", "aqua", "lofi", "pastel", "fantasy", 
  "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", 
  "business", "acid", "lemonade", "night", "coffee", "winter"
];

function Settings() {
  const [currentTheme, setCurrentTheme] = useState("cupcake");

  useEffect(() => {
    // Get current theme from HTML attribute
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    if (htmlTheme) {
      setCurrentTheme(htmlTheme);
    }
  }, []);

  const changeTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto bg-base-100 rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        {/* Theme Preview Section */}
        <div className="mb-8 p-4 border border-base-300 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Theme Preview: <span className="capitalize">{currentTheme}</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary">Primary</button>
                <button className="btn btn-secondary">Secondary</button>
                <button className="btn btn-accent">Accent</button>
                <button className="btn btn-neutral">Neutral</button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-info">Info</button>
                <button className="btn btn-success">Success</button>
                <button className="btn btn-warning">Warning</button>
                <button className="btn btn-error">Error</button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-outline">Outline</button>
                <button className="btn btn-ghost">Ghost</button>
                <button className="btn btn-link">Link</button>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" className="checkbox" checked readOnly />
                <input type="radio" className="radio" checked readOnly />
                <input type="range" className="range range-primary w-full max-w-xs" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="alert alert-info">
                <span>This is an info alert</span>
              </div>
              
              <div className="flex gap-2">
                <div className="badge">Badge</div>
                <div className="badge badge-primary">Primary</div>
                <div className="badge badge-secondary">Secondary</div>
                <div className="badge badge-accent">Accent</div>
              </div>
              
              <progress className="progress progress-primary w-full" value="40" max="100"></progress>
              
              <div className="card bg-base-300 p-4">
                <h3 className="card-title text-base">Card Title</h3>
                <p className="text-sm">This is a card with the current theme.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Theme Selection</h2>
          <p className="mb-4 text-sm text-gray-500">Choose your preferred theme for the application</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <div 
                key={theme}
                className={`cursor-pointer rounded-lg p-2 transition-all ${
                  currentTheme === theme ? 'ring-2 ring-primary' : 'hover:bg-base-200'
                }`}
                onClick={() => changeTheme(theme)}
              >
                <div data-theme={theme} className="bg-base-100 rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{theme}</span>
                    {currentTheme === theme && (
                      <div className="badge badge-primary badge-sm">Active</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <div className="bg-primary w-5 h-5 rounded"></div>
                    <div className="bg-secondary w-5 h-5 rounded"></div>
                    <div className="bg-accent w-5 h-5 rounded"></div>
                    <div className="bg-neutral w-5 h-5 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;