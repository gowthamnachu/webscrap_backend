import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
};

const saveScrapedData = async (data) => {
  const supabase = getSupabaseClient();
  
  const { data: result, error } = await supabase
    .from('scraped_data')
    .insert([{
      url: data.url,
      title: data.title,
      content: data,
      ai_analysis: data.aiAnalysis || null,
      scraped_at: data.scrapedAt || new Date().toISOString(),
      method: data.method || 'auto'
    }])
    .select();

  if (error) throw error;
  return result[0];
};

const getAllData = async (page = 1, limit = 10) => {
  const supabase = getSupabaseClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('scraped_data')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getDataById = async (id) => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('scraped_data')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

const deleteData = async (id) => {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('scraped_data')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

const getStatistics = async () => {
  const supabase = getSupabaseClient();
  
  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('scraped_data')
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;

  // Get unique URLs count
  const { data: urlData, error: urlError } = await supabase
    .from('scraped_data')
    .select('url');

  if (urlError) throw urlError;

  const uniqueUrls = new Set(urlData.map(item => item.url)).size;

  // Get recent scrapes (last 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: recentCount, error: recentError } = await supabase
    .from('scraped_data')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString());

  if (recentError) throw recentError;

  return {
    totalScraped: totalCount || 0,
    uniqueUrls: uniqueUrls || 0,
    recentScrapes: recentCount || 0
  };
};

export { saveScrapedData, getAllData, getDataById, deleteData, getStatistics, getSupabaseClient };
