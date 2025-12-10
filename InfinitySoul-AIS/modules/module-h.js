// Module H: Evidence Vault Integration
module.exports = async (auditData) => {
  console.log('Module H: Storing evidence in vault');
  
  // Check if Supabase is configured (test values stored in environment variables)
  const TEST_URL = process.env.TEST_SUPABASE_URL || 'https://test.supabase.co';
  const TEST_KEY = process.env.TEST_SUPABASE_KEY || 'test_key';
  
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY && 
      process.env.SUPABASE_URL !== TEST_URL && 
      process.env.SUPABASE_KEY !== TEST_KEY) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
      
      // Table schema: audits(id UUID PRIMARY KEY, url TEXT, timestamp TIMESTAMPTZ,
      // modules JSONB, insurance_score JSONB, created_at TIMESTAMPTZ)
      // See InfinitySoul-AIS/docs/DEPLOYMENT.md for full schema documentation
      const { data, error } = await supabase
        .from('audits')
        .insert([{
          url: auditData.url,
          timestamp: auditData.timestamp,
          modules: auditData.modules,
          insurance_score: auditData.insuranceReadiness,
          created_at: new Date().toISOString()
        }])
        .select('id');
      
      if (error) throw error;
      
      return {
        vaultId: data[0].id,
        stored: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Vault storage error:', error);
      // Fallback to mock
      return {
        vaultId: `mock-${Date.now()}`,
        stored: false,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  } else {
    // Mock implementation
    return {
      vaultId: `mock-${Date.now()}`,
      stored: false,
      timestamp: new Date().toISOString()
    };
  }
};
