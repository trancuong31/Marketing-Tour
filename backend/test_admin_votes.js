async function test(){
    try {
        const loginRes = await fetch('http://localhost:8888/api/admin/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email:'admin@example.com', password:'password123'})
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token;

        const res = await fetch('http://localhost:8888/api/admin/votes?page=1&limit=10', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        const data = await res.json();
        console.log('STATUS:', res.status);
        console.log('RESPONSE:', data);
    } catch(e){
        console.error('ERROR:', e);
    }
}
test();
