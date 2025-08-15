const { createClient } = require('@supabase/supabase-js');


const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const ALLOWED_ORIGINS = ['https://cardwas.com', 'https://cardwas.com/','http://cardwas.com','http://cardwas.com/'];


console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_KEY ? '***' : 'missing');
console.log('API_SECRET_KEY:', API_SECRET_KEY ? '***' : 'missing');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {
    console.log('Handler start, event.headers.origin:', event.headers.origin);
    console.log('Handler start, event.headers:', event.headers);
    try {
        const origin = event.headers.origin || '';
        // 先注释掉 origin 校验，方便调试
        if (!ALLOWED_ORIGINS.includes(origin)) {
            return { statusCode: 403, body: 'Forbidden: invalid origin' };
        }

        const corsHeaders = {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        };

        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 204,
                headers: corsHeaders,
                body: '',
            };
        }

        if (event.httpMethod === 'GET') {
            const { data, error } = await supabase
                .from('clicks')
                .select('count')
                .eq('id', 1)
                .single();

            if (error) throw error;

            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ count: data.count }) };
        }

        if (event.httpMethod === 'POST') {
            // const reqApiKey = event.headers['x-api-key'] || '';
            //
            // if (reqApiKey !== API_SECRET_KEY) {
            //     return { statusCode: 403, headers: corsHeaders, body: 'Forbidden: invalid API key' };
            // }

            const { data: row, error: selectErr } = await supabase
                .from('clicks')
                .select('count')
                .eq('id', 1)
                .single();

            if (selectErr) throw selectErr;

            const newCount = row.count + 1;

            const { error: updateErr } = await supabase
                .from('clicks')
                .update({ count: newCount })
                .eq('id', 1);

            if (updateErr) throw updateErr;

            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ count: newCount }) };
        }

        return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: corsHeaders, body: 'Server Error' };
    }
};
