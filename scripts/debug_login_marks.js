const http = require('http');

console.log('\nTesting API Endpoint: /api/student/debug-marksheets/xisesawe');
http.get('http://localhost:5001/api/student/debug-marksheets/xisesawe', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log('API Response Status:', res.statusCode);
            console.log('API Response Data:', JSON.stringify(parsedData, null, 2));
            process.exit();
        } catch (e) {
            console.error('API Error:', e.message);
            console.log('Raw Data:', rawData);
            process.exit(1);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    process.exit(1);
});
