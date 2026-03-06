const axios = require('axios');

async function testApi() {
    try {
        const response = await axios.post(
            'http://support.fondazionesancarlo.dom/ost_wbs/index.php',
            {
                query: "user",
                condition: "specific",
                sort: "email",
                parameters: { email: "sguido@fondazionesancarlo.it" }
            },
            {
                headers: {
                    'apikey': '16F81B139615F2BE042ACDBB05CED24C',
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("RESPONSE DATA:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.error("AXIOS ERROR RESPONSE:");
            console.error(JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("UNKNOWN ERROR:", e.message);
        }
    }
}

testApi();
