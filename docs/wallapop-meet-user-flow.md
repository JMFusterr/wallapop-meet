# Flujo de usuario Wallapop Meet (Mermaid)

Este documento fija el user flow oficial de Wallapop Meet para consulta rapida de producto, diseno y desarrollo.

## Diagrama

```mermaid
graph TD
P1["Vendedor propone quedada"]
B1{"Comprador acepta o propone cambios?"}
C1["Comprador propone cambios"]
X1["Card anterior cancelada (COUNTER_REPLACED)"]
P2["Nueva meetup card COUNTER_PROPOSED en lado comprador"]
CF["Quedada confirmada (CONFIRMED)"]
BN["Banner fijo: venta pendiente + countdown"]

P1 --> B1
B1 -->|Aceptar| CF
B1 -->|Proponer cambios| C1 --> X1 --> P2 --> CF
CF --> BN

A1{"Dentro de -30m/+2h?"}
AR["CTA Estoy aqui"]
RV["Vendedor marca llegada (ARRIVED)"]
CS["Boton rosa: Confirmar venta"]
OK["Venta completada (COMPLETED) + score positivo ambos"]

CF --> A1
A1 -->|Si| AR --> RV --> CS --> OK
A1 -->|No| CF

NS["CTA El comprador no ha aparecido"]
G1{"Han pasado +5 min desde la hora?"}
ER["Error temporal: dar 5 min de cortesia"]
BS["Bottom Sheet de confirmacion"]
GPS{"Comprador marco llegada <=100m?"}
AL["Alerta suave: radar indica que esta cerca"]
FN["CTA Definitivamente no esta"]
CA["CANCELLED + penalizacion comprador + articulo disponible"]

RV --> NS --> G1
G1 -->|No| ER --> NS
G1 -->|Si| BS --> GPS
GPS -->|No| CA
GPS -->|Si| AL --> FN --> CA

classDef vendedor fill:#00C7AE,stroke:#0B6B5E,color:#073B35,stroke-width:1.5px;
classDef comprador fill:#DCEBFF,stroke:#4F7DB8,color:#1E3A5F,stroke-width:1.5px;
classDef sistema fill:#FFE8CC,stroke:#C77D2B,color:#5C3A16,stroke-width:1.5px;
classDef decision fill:#F3F4F6,stroke:#6B7280,color:#111827,stroke-width:1.5px;

class P1,X1,P2,RV,CS,NS,FN vendedor;
class C1 comprador;
class CF,BN,AR,OK,ER,BS,AL,CA sistema;
class B1,A1,G1,GPS decision;
```
