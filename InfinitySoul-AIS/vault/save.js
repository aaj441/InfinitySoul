const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (auditData) => {
  const { data, error } = await supabase
    .from('audits')
    .insert([auditData])
    .select('id');
  
  if (error) throw error;
  return data[0].id;
};
