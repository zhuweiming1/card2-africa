exports.handler = async (event) => {
    console.log('Handler start, event.headers.origin:', event.headers.origin);
    console.log('Handler start, event.headers:', event.headers);

    const origin = event.headers.origin || '';

    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    try {
        // 先注释掉 origin 校验，方便调试
        if (!ALLOWED_ORIGINS.includes(origin)) {
            return { statusCode: 403, headers: corsHeaders, body: 'Forbidden: invalid origin' };
        }

        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 204,
                headers: corsHeaders,
                body: '',
            };
        }

        if (event.httpMethod === 'GET') {
            const { data, error } = await supabase
                .from('cardwasClick')
                .select('count')
                .eq('id', 1)
                .single();

            if (error) throw error;

            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ count: data.count }) };
        }

        if (event.httpMethod === 'POST') {
            const { data: row, error: selectErr } = await supabase
                .from('cardwasClick')
                .select('count')
                .eq('id', 1)
                .single();

            if (selectErr) throw selectErr;

            const newCount = row.count + 1;

            const { error: updateErr } = await supabase
                .from('cardwasClick')
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
