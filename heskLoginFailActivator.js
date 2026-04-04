const { execSync } = require('child_process');
const readline = require('readline');

const container = 'hesk-web';
const filePath = '/var/www/html/admin/index.php'; 

const run = (cmd) => {
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        console.log("Error al ejecutar el comando.");
    }
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const menu = () => {
    console.log(`
--- CONTROL DE HESK-WEB ---
1. MODO OK: Restaurar todo (Container arriba, archivo OK, sin lag).
2. INDICADOR 1 (Código <> 200): Renombrar index.php a .bak (Dará 404).
3. INDICADOR 1 (Caída total): Detener el contenedor (docker stop).
4. INDICADOR 2 (Lento > 2s): Inyectar 3s de latencia de red.
5. Salir.
Seleccione opción: `);
};

rl.on('line', (input) => {
    switch (input) {
        case '1':
            console.log("Restaurando...");
            run(`docker start ${container}`);
            run(`docker exec ${container} mv ${filePath}.bak ${filePath}`);
            run(`docker exec ${container} sed -i '/sleep(3);/d' /var/www/html/admin/index.php`);
            break;
        case '2':
            console.log("Simulando Error 404...");
            run(`docker exec ${container} mv ${filePath} ${filePath}.bak`);
            break;
        case '3':
            console.log("Apagando contenedor...");
            run(`docker stop ${container}`);
            break;
        case '4':
            console.log("Inyectando lag de 3 segundos...");
            run(`docker exec -u 0 ${container} sed -i '2i sleep(3);' /var/www/html/admin/index.php`);
            break;
        case '5': process.exit();
    }
    menu();
});

menu();