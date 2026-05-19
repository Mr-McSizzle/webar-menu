import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Sparkles, Trash2, Download, Eye, ImageIcon, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../supabaseClient';

const AdminDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [analytics, setAnalytics] = useState({ totalScans: 0, topDish: null });

  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching menu items:', error);
      addToast('Failed to load menu items', 'error');
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*');

    if (!error && data) {
      const totalScans = data.length;
      const dishCounts = {};
      data.forEach(event => {
        if (event.dish_id) {
          dishCounts[event.dish_id] = (dishCounts[event.dish_id] || 0) + 1;
        }
      });
      const topDishId = Object.keys(dishCounts).sort((a, b) => dishCounts[b] - dishCounts[a])[0];
      setAnalytics({ totalScans, topDishId, dishCounts });
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
    fetchAnalytics();

    // Real-time subscription for menu item changes
    const channel = supabase
      .channel('menu-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMenuItems(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMenuItems(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
        } else if (payload.eventType === 'DELETE') {
          setMenuItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMenuItems, fetchAnalytics]);

  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormCategory('');
    setFormDescription('');
    setFormImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newItem = {
        name: formName,
        description: formDescription,
        price: parseFloat(formPrice),
        category: formCategory || 'Uncategorized',
        status: 'processing',
      };

      // Upload image to Supabase Storage if provided
      if (formImage) {
        const fileExt = formImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('dish-images')
          .upload(fileName, formImage);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('dish-images')
            .getPublicUrl(fileName);
          newItem.image_url = urlData.publicUrl;
        } else {
          console.warn('Image upload failed (Storage bucket may not exist):', uploadError.message);
        }
      }

      const { error: insertError } = await supabase
        .from('menu_items')
        .insert([newItem]);

      if (insertError) throw insertError;

      addToast(`"${formName}" added! AI is now processing...`);
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
    if (error) {
      addToast('Failed to delete: ' + error.message, 'error');
    } else {
      addToast(`"${item.name}" deleted.`);
    }
  };

  const handleDownloadQR = (item) => {
    const svg = document.getElementById(`qr-${item.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `${item.name.replace(/\s+/g, '-')}-QR.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getStatusClass = (status) => {
    if (status === 'ready') return 'status-ready';
    if (status === 'processing' || status === 'processed') return 'status-processing';
    return 'status-error';
  };

  const getTopDishName = () => {
    if (!analytics.topDishId) return '—';
    const dish = menuItems.find(d => d.id === analytics.topDishId);
    return dish?.name || '—';
  };

  if (loading) {
    return <div className="loading-screen"><span className="spinner-inline" style={{ marginRight: '0.5rem' }} /> Loading dashboard...</div>;
  }

  return (
    <div className="page animate-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Menu Dashboard</h1>
          <p style={{ marginTop: '0.3rem' }}>Manage your AR dishes, QR codes & analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => { fetchMenuItems(); fetchAnalytics(); }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} />
            {showAddForm ? 'Cancel' : 'Add Dish'}
          </button>
        </div>
      </div>

      {/* Add Dish Form */}
      {showAddForm && (
        <div className="card add-form animate-in">
          <h3>
            <Sparkles size={18} color="var(--accent)" /> Add New Dish
          </h3>
          <form onSubmit={handleAddDish}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dish-name">Dish Name *</label>
                <input id="dish-name" type="text" placeholder="e.g. Wagyu Steak" value={formName} onChange={e => setFormName(e.target.value)} required />
              </div>
              <div className="form-group small">
                <label htmlFor="dish-price">Price ($) *</label>
                <input id="dish-price" type="number" step="0.01" placeholder="0.00" value={formPrice} onChange={e => setFormPrice(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="dish-category">Category</label>
                <input id="dish-category" type="text" placeholder="e.g. Mains" value={formCategory} onChange={e => setFormCategory(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="dish-desc">Description</label>
              <textarea id="dish-desc" placeholder="Describe the dish for the AI nutritional analysis..." rows={3} value={formDescription} onChange={e => setFormDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Food Photo (optional)</label>
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="upload-preview" />
                ) : (
                  <>
                    <ImageIcon size={28} color="var(--text-muted)" />
                    <p>Click to upload an image</p>
                  </>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '0.5rem' }}>
              {submitting ? <><span className="spinner-inline" /> Submitting...</> : 'Generate 3D Model & Analyze'}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-label">Total Dishes</div>
          <div className="stat-value">{menuItems.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">AR Ready</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {menuItems.filter(i => i.status === 'ready').length}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total AR Scans</div>
          <div className="stat-value">{analytics.totalScans}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Top Scanned Dish</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>{getTopDishName()}</div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={40} color="var(--text-muted)" />
          <h3 style={{ color: 'var(--text-muted)' }}>No dishes yet</h3>
          <p>Click "Add Dish" to create your first AR menu item.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item.id} className="card dish-card">
              <div className="dish-header">
                <span className="dish-name">{item.name}</span>
                <span className={`status-badge ${getStatusClass(item.status)}`}>
                  {item.status === 'processing' && <span className="spinner-inline" style={{ width: 10, height: 10 }} />}
                  {item.status}
                </span>
              </div>
              <div className="dish-meta">${Number(item.price).toFixed(2)} • {item.category || 'Uncategorized'}</div>

              {item.nutrition && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', background: 'var(--accent-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  🔬 {item.nutrition.calories || '—'} cal • {item.nutrition.protein || '—'} protein • {item.nutrition.carbs || '—'} carbs
                </div>
              )}

              <div className="qr-container">
                <QRCodeSVG id={`qr-${item.id}`} value={`${window.location.origin}/ar/${item.id}`} size={120} />
              </div>

              <div className="dish-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadQR(item)}>
                  <Download size={14} /> QR
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => window.open(`/ar/${item.id}`, '_blank')}>
                  <Eye size={14} /> Preview
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
