export const environment = {
    production: false,
    firebaseConfig: {
        apiKey: "AIzaSyBTV2WDmXRbBczk3JUIE17J2DSG-YHQMj8",
        authDomain: "gestionfarmacia-148da.firebaseapp.com",
        databaseURL: "https://gestionfarmacia-148da-default-rtdb.firebaseio.com",
        projectId: "gestionfarmacia-148da",
        storageBucket: "gestionfarmacia-148da.firebasestorage.app",
        messagingSenderId: "515990134299",
        appId: "1:515990134299:web:1237169a0190d66f83a2be"
    },
    usuarios: [
        {
            nombre: "ROBERTO CARLOS YOXON CUJ",
            usuario: "10001400",
            rol: "ENCARGADO",
            revisa_a: 'MARIA ELENA AJCALON SAPUT',
            password: "7897"
        },
        {
            nombre: "MARIA ELENA AJCALON SAPUT",
            usuario: "10008450",
            rol: "SUB_ENCARGADO",
            revisa_a: 'ROBERTO CARLOS YOXON CUJ',
            password: "1879"
        },
        {
            nombre: "DORCAS ELIZABETH YOXON TERETA",
            usuario: "10014453",
            rol: "DEPENDIENTE",
            revisa_a: 'GERSON EMMANUEL BARRENO GARCIA',
            password: "2222"
        },
        {
            nombre: "GERSON EMMANUEL BARRENO GARCIA",
            usuario: "10019034",
            rol: "DEPENDIENTE",
            revisa_a: 'ROSEMARY EDITH MORALES SACUJ',
            password: "2222"
        },
        {
            nombre: "ROSEMARY EDITH MORALES SACUJ",
            usuario: "10018698",
            rol: "DEPENDIENTE",
            revisa_a: 'DORCAS ELIZABETH YOXON TERETA',
            password: "2222"
        }
    ]
};