# Proceso de seguimiento de incidentes

El equipo usa **GitHub Issues** como sistema de seguimiento de incidentes y **GitHub Projects** como tablero Kanban. Este documento define cómo se reporta, clasifica, resuelve y cierra un incidente.

## 1. Ciclo de vida de un incidente

| Etapa | Qué pasa | Dónde se ve |
|---|---|---|
| **1. Detección** | Alguien encuentra el error (prueba manual, prueba automática del CI o usuario) y lo reporta con la plantilla *Reporte de error*. | Issue nuevo con label `bug` |
| **2. Triaje** | Se revisa que no esté duplicado, se asigna **severidad**, **prioridad**, **módulo** y **responsable**. | Labels y *Assignees*; columna **To Do** |
| **3. Diagnóstico** | El responsable reproduce el error y encuentra la causa raíz. La deja escrita como comentario en el issue. | Comentario en el issue; columna **In Progress** |
| **4. Resolución** | Se crea la rama `fix/...` desde `develop`, se corrige, se añade una prueba que falle sin el arreglo y se abre el PR con `Closes #n`. | PR enlazado; el CI debe pasar |
| **5. Cierre** | Un compañero aprueba el PR y se fusiona. GitHub cierra el issue automáticamente y la tarjeta pasa a **Done**. | Issue cerrado como *completed* |

## 2. Severidad y prioridad

| Severidad | Criterio | Prioridad por defecto |
|---|---|---|
| Crítica | El sistema o un módulo completo no se puede usar. | `prioridad: alta`, se atiende el mismo día |
| Alta | Una función importante falla y no hay alternativa. | `prioridad: alta` |
| Media | Falla, pero hay una forma de seguir trabajando. | `prioridad: media` |
| Baja | Detalle visual o de texto. | `prioridad: baja` |

## 3. Labels

- **Prioridad:** `prioridad: alta`, `prioridad: media`, `prioridad: baja`.
- **Tipo** (igual que el prefijo del commit): `tipo: feature`, `tipo: fix`, `tipo: docs`, `tipo: chore`, y `bug` para incidentes.
- **Módulo:** `módulo: libros`, `módulo: socios`, `módulo: préstamos`, `módulo: reportes`.

Cada issue lleva **una** prioridad, **un** tipo y, si aplica, **un** módulo.

## 4. Reglas del equipo

1. **Nada sin issue:** toda rama nace de un issue; la rama y el PR lo referencian.
2. **Reportes completos:** pasos para reproducir, resultado esperado vs. real y entorno. Un reporte sin esos datos vuelve a quien lo abrió.
3. **Sin duplicados:** antes de abrir un issue se busca en los existentes; si ya está, se comenta en el original.
4. **Sin tickets huérfanos:** todo issue abierto tiene responsable. Lo que lleva más de una semana sin movimiento se revisa en la reunión del equipo.
5. **Cierre por PR:** un issue de código se cierra con `Closes #n` desde su PR, nunca a mano.
6. **Todo bug arreglado deja una prueba** que lo habría detectado, para que no vuelva.

## 5. Métricas

| Métrica | Cómo se calcula aquí |
|---|---|
| **MTTR** (tiempo medio de resolución) | Promedio de *fecha de cierre − fecha de apertura* de los issues con label `bug`. |
| **DRE** (eficiencia de eliminación de defectos) | Bugs detectados antes de llegar a `main` ÷ total de bugs. |
| **Tasa de escape** | Bugs detectados en `main` (release publicada) ÷ total de bugs. |

Se consultan con:

```bash
gh issue list --label bug --state closed --json number,createdAt,closedAt
```
