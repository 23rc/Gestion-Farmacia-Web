export const environment = {
    production: false,
    FechaEstantería: "09/07/2025",
    FechaProductosMalEstado: "24/07/2025",
    firebaseConfig: {
        apiKey: "AIzaSyA6PfA4p98c_23JEblRaVgD3UQ1njg9GvY",
        authDomain: "gestionfarmacia-984e0.firebaseapp.com",
        databaseURL: "https://gestionfarmacia-984e0-default-rtdb.firebaseio.com",
        projectId: "gestionfarmacia-984e0",
        storageBucket: "gestionfarmacia-984e0.appspot.com",
        messagingSenderId: "370812908336",
        appId: "1:370812908336:web:3be229ced0f28c752a4ef5"
    },

    // usuarios: [
    //     {
    //         nombre: "ROBERTO CARLOS YOXON CUJ",
    //         usuario: "10001400",
    //         password: "7897"
    //     },
    //     {
    //         nombre: "MARIA ELENA AJCALON SAPUT",
    //         usuario: "10008450",
    //         password: "1879"
    //     },
    //     {
    //         nombre: "DORCAS ELIZABETH YOXON TERETA",
    //         usuario: "10014453",
    //         password: "2222"
    //     },
    //     {
    //         nombre: "GERSON EMMANUEL BARRENO GARCIA",
    //         usuario: "10019034",
    //         password: "2222"
    //     },
    //     {
    //         nombre: "ROSEMARY EDITH MORALES SACUJ",
    //         usuario: "10018698",
    //         password: "2222"
    //     }
    // ]
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
            password: "3497"
        },
        {
            nombre: "DORCAS ELIZABETH YOXON TERETA",
            usuario: "10014453",
            rol: "DEPENDIENTE",
            revisa_a: 'ROSEMARY EDITH MORALES SACUJ',
            password: "4321"
        },
        {
            nombre: "GERSON EMMANUEL BARRENO GARCIA",
            usuario: "10019034",
            rol: "DEPENDIENTE",
            revisa_a: 'JOSIAS EMANUEL MUJ COROXON',
            password: "5855"
        },
        {
            nombre: "ROSEMARY EDITH MORALES SACUJ",
            usuario: "10018698",
            rol: "DEPENDIENTE",
            revisa_a: 'DORCAS ELIZABETH YOXON TERETA',
            password: "8698"
        },
        {
            nombre: "JOSIAS EMANUEL MUJ COROXON",
            usuario: "10020825",
            rol: "DEPENDIENTE",
            revisa_a: 'GERSON EMMANUEL BARRENO GARCIA',
            password: "2345"
        }
    ]
};