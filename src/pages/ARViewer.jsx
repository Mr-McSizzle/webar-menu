import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Info, X } from 'lucide-react';

const ARViewer = () => {
  const { dishId } = useParams();
  const [showInfo, setShowInfo] = useState(false);
  const [dishData, setDishData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDish = async () => {
      const { data, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', dishId)
        .single();

      if (fetchError) {
        setError('Dish not found.');
        console.error(fetchError);
      } else {
        setDishData(data);
      }
      setLoading(false);
    };

    fetchDish();

    // Log analytics event
    supabase
      .from('analytics_events')
      .insert([{ dish_id: dishId, event_type: 'ar_view' }])
      .then(({ error: analyticsError }) => {
        if (analyticsError) console.warn('Analytics logging failed:', analyticsError.message);
      });
  }, [dishId]);

  if (loading) {
    return (
      <div className="ar-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ar-fallback">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading dish...</p>
        </div>
      </div>
    );
  }

  if (error || !dishData) {
    return (
      <div className="ar-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ar-fallback">
          <h2 style={{ color: 'var(--danger)' }}>{error || 'Dish not found'}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This QR code may be invalid or the dish was removed.</p>
        </div>
      </div>
    );
  }

  const nutrition = dishData.nutrition || {};
  const hasModel = dishData.model_url && dishData.model_url !== 'https://example.com/mock-model.glb';

  return (
    <div className="ar-page">
      {/* Top overlay */}
      <div className="ar-overlay-top">
        <div className="ar-dish-info">
          <h1>{dishData.name}</h1>
          <span className="price">${Number(dishData.price).toFixed(2)}</span>
          {dishData.category && (
            <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {dishData.category}
            </span>
          )}
        </div>
        <button className="ar-info-btn" onClick={() => setShowInfo(!showInfo)}>
          {showInfo ? <X size={20} /> : <Info size={20} />}
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="ar-info-panel animate-in">
          {dishData.description && (
            <>
              <h3>Description</h3>
              <p style={{ marginBottom: '1rem' }}>{dishData.description}</p>
            </>
          )}

          {Object.keys(nutrition).length > 0 && (
            <>
              <h3>Nutritional Facts</h3>
              <div className="nutrition-grid">
                {nutrition.calories != null && (
                  <div className="nutrition-item">
                    <span>Calories</span>
                    <b>{nutrition.calories} kcal</b>
                  </div>
                )}
                {nutrition.protein && (
                  <div className="nutrition-item">
                    <span>Protein</span>
                    <b>{nutrition.protein}</b>
                  </div>
                )}
                {nutrition.carbs && (
                  <div className="nutrition-item">
                    <span>Carbs</span>
                    <b>{nutrition.carbs}</b>
                  </div>
                )}
                {nutrition.fat && (
                  <div className="nutrition-item">
                    <span>Fat</span>
                    <b>{nutrition.fat}</b>
                  </div>
                )}
                {nutrition.fiber && (
                  <div className="nutrition-item">
                    <span>Fiber</span>
                    <b>{nutrition.fiber}</b>
                  </div>
                )}
                {nutrition.sodium && (
                  <div className="nutrition-item">
                    <span>Sodium</span>
                    <b>{nutrition.sodium}</b>
                  </div>
                )}
              </div>
              <div className="ai-badge">✨ Analyzed by Gemini AI</div>
            </>
          )}

          {Object.keys(nutrition).length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Nutritional data is still being processed by AI...
            </p>
          )}
        </div>
      )}

      {/* 3D Model Viewer or Fallback */}
      <div className="ar-model-container">
        {hasModel ? (
          <model-viewer
            src={dishData.model_url}
            alt={`3D model of ${dishData.name}`}
            auto-rotate
            camera-controls
            ar
            ar-modes="webxr scene-viewer quick-look"
            shadow-intensity="1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-dark)' }}
          >
            <button slot="ar-button" style={{
              position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              padding: '0.8rem 2rem', borderRadius: '30px', border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124, 92, 252, 0.4)',
              fontFamily: 'var(--font)'
            }}>
              👀 View in AR
            </button>
          </model-viewer>
        ) : (
          <div className="ar-fallback">
            {dishData.status === 'processing' ? (
              <>
                <div className="spinner"></div>
                <h3 style={{ color: 'var(--text-primary)' }}>Generating 3D Model...</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                  Our AI is creating a photorealistic 3D model of this dish.
                  This usually takes 1-3 minutes. Refresh to check.
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--accent-subtle)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem'
                }}>
                  🍽️
                </div>
                <h3 style={{ color: 'var(--text-primary)' }}>{dishData.name}</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                  {dishData.description || 'A delicious dish from our menu.'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  3D model is being prepared. Check back soon!
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ARViewer;
