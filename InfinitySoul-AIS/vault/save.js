module.exports = async (auditData) => {
  // Check if Supabase is configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY && 
      process.env.SUPABASE_URL !== 'https://test.supabase.co' && 
      process.env.SUPABASE_KEY !== 'test_key') {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
      
      const { data, error } = await supabase
        .from('audits')
        .insert([auditData])
        .select('id');
      
      if (error) throw error;
      return data[0].id;
    } catch (error) {
      console.warn('Supabase save failed, using mock ID:', error.message);
      return `mock-${Date.now()}`;
    }
  } else {
    // Mock implementation for testing
    console.log('Using mock vault (Supabase not configured)');
    return `mock-${Date.now()}`;
  }
};
