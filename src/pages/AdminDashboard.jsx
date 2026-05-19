import React, { useState } from 'react';
import { Plus, Image as ImageIcon, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [menuItems, setMenuItems] = useState([
    { id: 'dish-123', name: 'Truffle Burger', price: 18, category: 'Mains', status: 'ready' }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Menu Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your AR dishes and QR codes</p>
        </div>
        <button className="flex items-center gap-4" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} />
          {showAddForm ? 'Cancel' : 'Add Dish'}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-color)" /> Add New Dish
          </h3>
          <form className="flex flex-col gap-4" style={{ maxWidth: '600px' }}>
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Dish Name</label>
                <input type="text" placeholder="e.g. Wagyu Steak" required />
              </div>
              <div style={{ width: '120px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Price ($)</label>
                <input type="number" placeholder="0.00" required />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description</label>
              <textarea placeholder="Describe the dish for the Gemini nutritional analysis..." rows={3}></textarea>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Food Photography</label>
              <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '8px', 
                padding: '2rem', 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <ImageIcon size={32} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Click to upload an image for 3D generation</p>
              </div>
            </div>

            <button type="submit" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
              Generate 3D Model & Analyze Nutrition
            </button>
          </form>
        </div>
      )}

      <div className="flex gap-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ flex: 1 }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total AR Scans</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>1,284</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>+12% this week</span>
        </div>
        <div className="glass-card" style={{ flex: 1 }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Avg. Engagement Time</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>1m 45s</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>+5s this week</span>
        </div>
        <div className="glass-card" style={{ flex: 1 }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Top Scanned Dish</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)', lineHeight: 1.2 }}>Truffle Burger</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>42% of all scans</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {menuItems.map(item => (
          <div key={item.id} className="glass-card flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{item.name}</h3>
                <span style={{ 
                  background: 'rgba(16, 185, 129, 0.2)', 
                  color: 'var(--success)', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>${item.price} • {item.category}</p>
            </div>
            
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <QRCodeSVG value={`${window.location.origin}/ar/${item.id}`} size={120} />
            </div>

            <div className="flex gap-4">
              <button style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                Download QR
              </button>
              <button style={{ flex: 1 }} onClick={() => window.open(`/ar/${item.id}`, '_blank')}>
                Preview AR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
