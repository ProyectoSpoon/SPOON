import React from 'react';

const TestInsights = () => {
  return (
    <div className='dashboard-card grid-area-insights'>
      <div style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px'}}>
        <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '16px'}}>
          📈 Área Insights Funcionando
        </h3>
        <div style={{background: '#fee2e2', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px'}}>
          <p style={{fontSize: '16px', fontWeight: 'bold'}}>
            ✅ PERFECTO - Aquí irá el gráfico de ventas
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestInsights;
