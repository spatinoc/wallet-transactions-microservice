# Wallet Microservice (NestJS + Fastify + TypeORM + Postgres)

Este repo contiene un microservicio que procesa transacciones básicas de una billetera digital (depósitos y retiros).
Incluye detección simple de fraude, pruebas unitarias y E2E, y manifiestos de Kubernetes.

## Despliegue local
1. Copiar `.env.example` a `.env`.


2. Levantar contenedor:

`docker-compose up -d --build`

3. URL de acceso a API:

`http://0.0.0.0:3000/`

## Endpoints

### 1. Crear transacción

**Endpoint**  
`POST /api/transactions`

**Descripción**  
Crea una nueva transacción para un usuario.

**Body (JSON)**

| Campo           | Tipo     | Obligatorio | Ejemplo                                  | Descripción                                          |
|-----------------|----------|-------------|------------------------------------------|------------------------------------------------------|
| `transaction_id`| string   | ✅           | `"5655ad9d-c5b4-4682-b211-e6781cb51bbf"` | Identificador único de la transacción.              |
| `user_id`       | string   | ✅           | `"7ba293e4-ca47-416b-9771-3fadec6f3c29"` | ID único del usuario.                               |
| `account_id`    | string   | ✅           | `"4425693c-ebed-4fa3-8033-fe52e412e840"` | ID de la cuenta asociada.                           |
| `amount`        | number   | ✅           | `1500.50`                                | Monto de la transacción.                            |
| `type`          | string   | ✅           | `"deposit"`                              | Tipo de transacción: `"deposit"` o `"withdraw"`.    |
| `timestamp`     | string   | ✅           | `"2025-08-11 14:30:00"`                 | Fecha y hora en formato ISO 8601.              |

**Ejemplo de petición (Body)**

```json
{
  "transaction_id": "5655ad9d-c5b4-4682-b211-e6781cb51bbf",
  "user_id": "7ba293e4-ca47-416b-9771-3fadec6f3c29",
  "account_id": "4425693c-ebed-4fa3-8033-fe52e412e840",
  "amount": 1500.50,
  "type": "deposit",
  "timestamp": "2025-08-11 14:30:00"
}
```

### 2. Listar transacciones de un usuario

**Endpoint**  
`GET /api/users/:userId/transactions?limit=&offset=&from=&to=`

**Descripción**  
Obtiene una lista de transacciones de un usuario filtradas por fecha y paginadas.

**Parámetros de ruta**

| Campo     | Tipo   | Obligatorio | Ejemplo      | Descripción               |
|-----------|--------|-------------|--------------|---------------------------|
| `userId`  | string | ✅           | `"7ba293e4-ca47-416b-9771-3fadec6f3c29"` | ID único del usuario.     |

**Query Params**

| Campo    | Tipo   | Obligatorio | Ejemplo                 | Descripción                                     |
|----------|--------|-------------|-------------------------|-------------------------------------------------|
| `limit`  | number | ❌           | `10`                    | Número máximo de transacciones a retornar.      |
| `offset` | number | ❌           | `0`                     | Desplazamiento para paginación.                 |
| `from`   | string | ❌           | `"2025-08-01 00:00:00"` | Fecha inicial (ISO 8601) para filtrar resultados. |
| `to`     | string | ❌           | `"2025-08-11 23:59:59"` | Fecha final (ISO 8601) para filtrar resultados.   |

**Ejemplo de petición**

```http
GET /api/users/7ba293e4-ca47-416b-9771-3fadec6f3c29/transactions?limit=5&offset=0&from=2025-08-01%2000%3A00%3A00&to=2025-08-11%2023%3A59%3A59
```

### 3. Consultar balance de un usuario

**Endpoint**  
`GET /api/users/:userId/balance`

**Descripción**  
Devuelve el saldo actual de un usuario.

**Parámetros de ruta**

| Campo     | Tipo   | Obligatorio | Ejemplo      | Descripción           |
|-----------|--------|-------------|--------------|-----------------------|
| `userId`  | string | ✅           | `"7ba293e4-ca47-416b-9771-3fadec6f3c29"` | ID único del usuario. |

**Ejemplo de petición**

```http
GET /api/users/7ba293e4-ca47-416b-9771-3fadec6f3c29/balance
```

## Tests
E2E:

`npm run test:e2e`

Unit tests:

`npm run test:unit`

## Kubernetes
Manifiestos en `k8s/` para Namespace, ConfigMap, Secret, Postgres StatefulSet, Deployment y Service.

## Respuestas a preguntas conceptuales

1. **¿Cómo manejarías picos altos de transacciones para garantizar escalabilidad?**

Una opción podría ser el uso de caching para agilizar las respuestas de lectura, otra también puede ser el uso de colas para evitar que la instancia de base de datos se sobrecargue con muchas peticiones al tiempo, y algo importante es el uso de índices en base de datos, para poder acceder a la información rápidamente y de manera eficiente. También es una buena estrategia separar las responsabilidades de lectura y escritura en base de datos usando clusters.

2. **¿Qué estrategias usarías para prevenir fraudes en un sistema de billetera digital?**

Estuve investigando al respecto y una de las estrategias es monitorear la cantidad de transacciones que un usuario hace en una ventana de X minutos, si se sobrepasa dicha cantidad se debería bloquear o deshabilitar la cuenta del usuario. Otro chequeo importante que se debería hacer es verificar una transacción en caso de que tenga un monto muy alto, por ejemplo usando preguntas de seguridad o autenticación en 2 pasos.

3. **Si detectas lentitud en el procesamiento de transacciones por alta concurrencia, ¿cómo procederías para mejorar el rendimiento?**

Hay que revisar si por ejemplo una transacción o consulta en base de datos está quedándose pegada, en ese caso se debería revisar si la consulta retorna solamente la información necesaria; si son muchas transacciones al mismo tiempo se podrían procesar en bloques, el uso de índices es fundamental para asegurar que se pueda acceder a la información rápidamente. En casos en los que sea necesario se podría también subir los recursos del servidor (CPU, RAM, IOPS, etc.).
