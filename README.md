# SGO-POC - Prueba Técnica DevOps

Sistema integrado de tickets HESK con monitoreo Zabbix, desplegado mediante contenedores Docker y automatizado con pipeline CI/CD.

## 📋 Descripción del Proyecto

Este proyecto implementa una solución completa DevOps que incluye:

- **Sistema de Tickets**: HESK (Help Desk Software) para gestión de tickets de soporte
- **Monitoreo**: Zabbix para supervisión de servicios y aplicaciones
- **CI/CD**: Pipeline automatizado con GitHub Actions para sincronización de categorías
- **Infraestructura como Código**: Docker Compose para orquestación de servicios

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│              (CI/CD - Sync Categories)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Docker Compose                          │
├──────────────────────┬──────────────────────────────────┤
│   HESK (Tickets)     │      Zabbix (Monitoring)         │
│  - hesk-web:8081     │    - zabbix-web:80               │
│  - hesk-db (MySQL)   │    - zabbix-server               │
│                      │    - zabbix-agent                │
│                      │    - zabbix-db (MySQL)           │
└──────────────────────┴──────────────────────────────────┘
```

### Redes Docker

- **front**: Red pública para acceso web
- **hesk-back**: Red interna para comunicación HESK-DB
- **zabbix-back**: Red interna para comunicación Zabbix-DB

## 🚀 Requisitos Previos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git 2.30+
- Node.js 20+ (para desarrollo local)

## 📦 Instalación y Despliegue

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/SGO-POC.git
cd SGO-POC
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```bash
# HESK Database
HESK_DB_NAME=hesk_db
HESK_DB_USER=hesk_user
HESK_DB_PASSWORD=tu_password_seguro
HESK_DB_ROOT_PASSWORD=root_password_seguro

# Zabbix Database
ZABBIX_DB_NAME=zabbix
ZABBIX_DB_USER=zabbix
ZABBIX_DB_PASSWORD=tu_password_zabbix
ZABBIX_DB_ROOT_PASSWORD=secret_root
```

### 3. Levantar los Servicios

```bash
docker-compose up -d
```

### 4. Verificar Estado de los Contenedores

```bash
docker-compose ps
```

## 🌐 Acceso a los Servicios

| Servicio | URL | Credenciales por Defecto |
|----------|-----|--------------------------|
| **HESK** | http://localhost:8081 | Configurar en primer acceso |
| **Zabbix** | http://localhost | Admin / zabbix |

## 🔄 Pipeline CI/CD

### Funcionamiento

El pipeline de GitHub Actions se activa automáticamente cuando se detectan cambios en `categories.txt`:

1. **Trigger**: Push a `categories.txt`
2. **Runner**: Self-hosted (ejecuta en el servidor)
3. **Proceso**:
   - Checkout del código
   - Instalación de Node.js 20
   - Ejecución de `sync_categories.js`
   - Sincronización idempotente de categorías en HESK

### Script de Sincronización

El archivo `sync_categories.js` implementa:

- ✅ **Idempotencia**: Verifica existencia antes de insertar
- ✅ **Validación**: Comprueba categorías existentes
- ✅ **Logging**: Reporta operaciones realizadas
- ✅ **Manejo de errores**: Exit code apropiado en fallos

### Configuración del Pipeline

**Secretos necesarios en GitHub**:

```
DB_USER     → Usuario de la base de datos HESK
DB_PASS     → Contraseña de la base de datos HESK
```

## 📝 Gestión de Categorías

### Agregar Nuevas Categorías

1. Editar `categories.txt`:

```txt
Infraestructura
Aplicaciones
Redes
Seguridad
Desarrollo
```

2. Commit y push:

```bash
git add categories.txt
git commit -m "feat: agregar nueva categoría"
git push origin main
```

3. El pipeline se ejecutará automáticamente

### Ejecución Manual

```bash
DB_USER=hesk_user DB_PASS=hesk_password DB_NAME=hesk_db node sync_categories.js
```

## 🔧 Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f [servicio]

# Detener servicios
docker-compose down

# Reiniciar un servicio
docker-compose restart [servicio]

# Ver estado de salud
docker-compose ps
```

### Acceso a Contenedores

```bash
# MySQL HESK
docker exec -it hesk-db mysql -uhesk_user -p hesk_db

# MySQL Zabbix
docker exec -it zabbix-db mysql -uzabbix -p zabbix

# Shell del contenedor web
docker exec -it hesk-web bash
```

## 🏥 Health Checks

Todos los servicios incluyen health checks configurados:

- **Bases de datos**: `mysqladmin ping` cada 10s
- **HESK Web**: Verificación HTTP endpoint cada 30s
- **Zabbix**: Ping del agente y verificación de servidor

## 📊 Monitoreo con Zabbix

### Configuración Inicial

1. Acceder a http://localhost
2. Login: `Admin` / `zabbix`
3. Configurar hosts para monitorear
4. Agregar templates según necesidad

### Integración HESK-Zabbix

El agente Zabbix está configurado para monitorear:

- Disponibilidad de servicios
- Uso de recursos (CPU, RAM, Disco)
- Estado de bases de datos
- Métricas personalizadas

## 🔒 Seguridad

### Buenas Prácticas Implementadas

- ✅ Redes internas aisladas para bases de datos
- ✅ Variables de entorno para credenciales
- ✅ Health checks para alta disponibilidad
- ✅ Volúmenes persistentes para datos
- ⚠️ **Importante**: Cambiar contraseñas por defecto en producción

### Recomendaciones para Producción

1. Usar secretos de Docker/Kubernetes
2. Implementar HTTPS con certificados válidos
3. Configurar firewall y restricción de puertos
4. Habilitar logs centralizados
5. Implementar backups automáticos

## 🧪 Testing

### Verificar Sincronización de Categorías

```bash
# Probar script localmente
DB_USER=hesk_user DB_PASS=hesk_password DB_NAME=hesk_db node sync_categories.js

# Verificar en base de datos
docker exec -it hesk-db mysql -uhesk_user -p hesk_db -e "SELECT * FROM hesk_categories;"
```

## 📂 Estructura del Proyecto

```
SGO-POC/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD
├── hesk-docker/                # Dockerfile para HESK
├── hesk/                       # Archivos fuente de HESK
├── actions-runner/             # GitHub Actions self-hosted runner
├── docker-compose.yml          # Orquestación de servicios
├── sync_categories.js          # Script de sincronización
├── categories.txt              # Categorías de HESK
├── .env                        # Variables de entorno (no versionado)
├── .env.example                # Template de variables
└── README.md                   # Este archivo
```

## 🐛 Troubleshooting

### Los contenedores no inician

```bash
# Ver logs detallados
docker-compose logs -f

# Verificar puertos en uso
sudo netstat -tulpn | grep -E ':(80|8081)'

# Recrear contenedores
docker-compose down -v
docker-compose up -d
```

### Pipeline CI/CD falla

1. Verificar secretos en GitHub Settings
2. Comprobar que el runner esté activo: Settings → Actions → Runners
3. Revisar logs del workflow en GitHub Actions

### Categorías no se sincronizan

```bash
# Verificar conectividad con DB
docker exec hesk-db mysqladmin -uhesk_user -p ping

# Ejecutar script manualmente con debug
DB_USER=hesk_user DB_PASS=hesk_password DB_NAME=hesk_db node sync_categories.js
```

## 🤝 Contribución

Este es un proyecto de prueba técnica. Para contribuir:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es una prueba técnica con fines educativos.

## 👤 Autor

Desarrollado como parte de una prueba técnica DevOps.

---

**Última actualización**: Abril 2026
